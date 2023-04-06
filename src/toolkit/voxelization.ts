import { mat4, vec2, vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { Octree } from 'toolkit/geometry/octree';
import { createVoxelContainer, VoxelChunk, VoxelState } from 'toolkit/geometry/voxel';
import type { RenderableBoundingBox } from './rendering/boundingBoxRenderer';

export function voxelizeMesh(
  mesh: { aabb: BoundingBox; triangles: Uint32Array; vertices: Float32Array | Float64Array },
  octree: Octree,
  voxelSize: number,
) {
  const blockSize = vec3.fromValues(voxelSize, voxelSize, voxelSize);
  return generateVoxelMesh(mesh, octree, blockSize);
}

function generateVoxelMesh(
  mesh: {
    aabb: BoundingBox;
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  },
  octree: Octree,
  voxelSize: vec3,
) {
  const chunkBlockCount = VoxelChunk.CHUNK_SIZE;
  const chunkSize = vec3.fromValues(
    chunkBlockCount[0] * voxelSize[0],
    chunkBlockCount[1] * voxelSize[1],
    chunkBlockCount[1] * voxelSize[2],
  );

  const blockTransform = mat4.create();
  const centre = BoundingBox.centre(mesh.aabb);
  vec3.negate(centre, centre);
  mat4.translate(blockTransform, blockTransform, centre);

  const boxes: RenderableBoundingBox[] = [];

  const blockCount = vec3.create();
  vec3.sub(blockCount, mesh.aabb.max, mesh.aabb.min);
  vec3.set(
    blockCount,
    Math.ceil(blockCount[0] / voxelSize[0]),
    Math.ceil(blockCount[1] / voxelSize[1]),
    Math.ceil(blockCount[2] / voxelSize[2]),
  );
  const chunks = vec3.fromValues(
    Math.ceil(blockCount[0] / chunkBlockCount[0]),
    Math.ceil(blockCount[1] / chunkBlockCount[1]),
    Math.ceil(blockCount[2] / chunkBlockCount[2]),
  );
  const voxels = createVoxelContainer();
  const isAABBInsideMesh = createIsAABBInsideMesh(octree);

  const aabb = mesh.aabb;
  const chunkAABB = BoundingBox.create();
  const blockAABB = BoundingBox.create();

  for (let z = 0; z < chunks[2]; ++z) {
    for (let y = 0; y < chunks[1]; ++y) {
      for (let x = 0; x < chunks[0]; ++x) {
        // build the chunk AABB
        vec3.set(
          chunkAABB.min,
          aabb.min[0] + x * chunkSize[0],
          aabb.min[1] + y * chunkSize[1],
          aabb.min[2] + z * chunkSize[2],
        );
        vec3.add(chunkAABB.max, chunkAABB.min, chunkSize);

        const chunk = VoxelChunk.create();

        // if the chunkAABB intersects with the mesh, build the chunk leaf nodes
        // by checking if each block intersects with the mesh
        if (octree.intersectAABB(chunkAABB)) {
          for (let k = 0; k < chunkBlockCount[2]; ++k) {
            for (let j = 0; j < chunkBlockCount[1]; ++j) {
              for (let i = 0; i < chunkBlockCount[0]; ++i) {
                vec3.set(
                  blockAABB.min,
                  chunkAABB.min[0] + i * voxelSize[0],
                  chunkAABB.min[1] + j * voxelSize[1],
                  chunkAABB.min[2] + k * voxelSize[2],
                );
                vec3.add(blockAABB.max, blockAABB.min, voxelSize);

                if (octree.intersectAABB(blockAABB)) {
                  boxes.push({
                    boundingBox: {
                      min: vec3.clone(blockAABB.min),
                      max: vec3.clone(blockAABB.max),
                    },
                    transform: blockTransform,
                    colour: [0.0, 1.0, 0.0],
                  });
                  chunk.addVoxel(i, j, k, VoxelState.Intersects);
                } else if (isAABBInsideMesh(blockAABB)) {
                  boxes.push({
                    boundingBox: {
                      min: vec3.clone(blockAABB.min),
                      max: vec3.clone(blockAABB.max),
                    },
                    transform: blockTransform,
                    colour: [1.0, 0.0, 0.0],
                  });
                  chunk.addVoxel(i, j, k, VoxelState.Inside);
                }
              }
            }
          }
        } else if (isAABBInsideMesh(chunkAABB)) {
          boxes.push({
            boundingBox: {
              min: vec3.clone(chunkAABB.min),
              max: vec3.clone(chunkAABB.max),
            },
            transform: blockTransform,
            colour: [0.0, 0.0, 1.0],
          });
          chunk.setAllVoxels(VoxelState.Inside);
        }

        voxels.insert(x, y, z, chunk);
      }
    }
  }

  return boxes;
}

function createIsAABBInsideMesh(octree: Octree) {
  const samples = generateSampleDirections();
  const minCoverage = 0.9;

  let coverage = 0;
  let misses = 0;
  let maxMisses = samples.length / 4; // Stopping Heuristic

  let origin = vec3.create();

  return function isAABBInsideMesh(aabb: BoundingBox) {
    coverage = 0;
    misses = 0;

    for (let i = 0; i < samples.length; i++) {
      BoundingBox.centre(aabb, origin);

      if (octree.intersectRay({ origin, dir: samples[i] })) {
        coverage++;
      } else {
        misses++;
      }

      if (misses >= maxMisses) {
        break;
      }
    }

    return coverage / samples.length >= minCoverage;
  };
}

/*
 * See: http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
 */
function generateSampleDirections() {
  const directions: vec3[] = [];
  let hammersly2D = vec2.create();
  let N = 100;

  for (let i = 0; i < N; ++i) {
    hammersly2D[0] = i / N;
    hammersly2D[1] = radicalInverseVdC(i);

    directions.push(uniformSphericalSampling(hammersly2D[0], hammersly2D[1]));
  }

  return directions;
}

function radicalInverseVdC(iBits: number) {
  let oBits = (iBits << 16) | (iBits >> 16);
  oBits = ((oBits & 0x55555555) << 1) | ((oBits & 0xaaaaaaaa) >> 1);
  oBits = ((oBits & 0x33333333) << 2) | ((oBits & 0xcccccccc) >> 2);
  oBits = ((oBits & 0x0f0f0f0f) << 4) | ((oBits & 0xf0f0f0f0) >> 4);
  oBits = ((oBits & 0x00ff00ff) << 8) | ((oBits & 0xff00ff00) >> 8);
  return oBits * 2.3283064365386963e-10; // / 0x100000000
}

function uniformSphericalSampling(u: number, v: number) {
  const phi = v * 2.0 * Math.PI;
  const cosTheta = 1.0 - u;
  const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);
  return vec3.fromValues(Math.cos(phi) * sinTheta, Math.sin(phi) * sinTheta, cosTheta);
}
