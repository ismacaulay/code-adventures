import ComputeWorker from './voxelization.worker?worker';

import { mat4, vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import {
  createVoxelContainer,
  VoxelChunk,
  VoxelState,
  type VoxelContainer,
} from 'toolkit/geometry/voxel';
import { createWorkerPool, type WorkerPool } from 'toolkit/workers/workerPool';
import { createIsAABBInsideMesh } from './utils';
import { intersectOctreeAABB, type MeshOctree } from 'toolkit/geometry/octree';

// TODO: Deduplicate the generation logic

enum ComputeFunctionKeys {
  ProcessChunk = 'processChunk',
}

type ComputeFunctions = {
  [ComputeFunctionKeys.ProcessChunk]: () => {};
};

export function voxelizeMeshSync(
  mesh: { aabb: BoundingBox; triangles: Uint32Array; vertices: Float32Array | Float64Array },
  octree: MeshOctree,
  voxelSize: vec3,
): VoxelContainer {
  return generateVoxelMesh(mesh, octree, voxelSize);
}

export async function voxelizeMesh(
  mesh: { aabb: BoundingBox; triangles: Uint32Array; vertices: Float32Array | Float64Array },
  octree: MeshOctree,
  voxelSize: vec3,
): Promise<VoxelContainer> {
  const workerPool = createWorkerPool<ComputeFunctions>(
    function createWorker() {
      const worker = new ComputeWorker();
      // TODO: used a shared array buffer for the octree buffer
      worker.postMessage({ name: 'init', args: [octree.buffer, voxelSize] });
      return worker;
    },
    { concurrency: 8 },
  );

  return generateVoxelMeshParallel(workerPool, mesh, voxelSize).then((result) => {
    workerPool.destroy();
    return result;
  });
}

function generateVoxelMesh(
  mesh: {
    aabb: BoundingBox;
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  },
  octree: MeshOctree,
  voxelSize: vec3,
) {
  const chunkBlockCount = VoxelChunk.CHUNK_SIZE;
  const chunkSize = vec3.fromValues(
    chunkBlockCount[0] * voxelSize[0],
    chunkBlockCount[1] * voxelSize[1],
    chunkBlockCount[2] * voxelSize[2],
  );

  const blockTransform = mat4.create();
  const centre = BoundingBox.centre(mesh.aabb);
  vec3.negate(centre, centre);
  mat4.translate(blockTransform, blockTransform, centre);

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
        if (intersectOctreeAABB(octree, chunkAABB)) {
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

                if (intersectOctreeAABB(octree, blockAABB)) {
                  chunk.addVoxel(i, j, k, VoxelState.Intersects);
                } else if (isAABBInsideMesh(blockAABB)) {
                  chunk.addVoxel(i, j, k, VoxelState.Inside);
                }
              }
            }
          }
        } else if (isAABBInsideMesh(chunkAABB)) {
          chunk.setAllVoxels(VoxelState.Inside);
        }

        voxels.insert(x, y, z, chunk);
      }
    }
  }

  return voxels;
}

async function generateVoxelMeshParallel(
  workerPool: WorkerPool<ComputeFunctions>,
  mesh: {
    aabb: BoundingBox;
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  },
  voxelSize: vec3,
) {
  return new Promise<ReturnType<typeof createVoxelContainer>>((res) => {
    const chunkBlockCount = VoxelChunk.CHUNK_SIZE;
    const chunkSize = vec3.fromValues(
      chunkBlockCount[0] * voxelSize[0],
      chunkBlockCount[1] * voxelSize[1],
      chunkBlockCount[2] * voxelSize[2],
    );

    const blockTransform = mat4.create();
    const centre = BoundingBox.centre(mesh.aabb);
    vec3.negate(centre, centre);
    mat4.translate(blockTransform, blockTransform, centre);

    const blockCount = vec3.create();
    vec3.sub(blockCount, mesh.aabb.max, mesh.aabb.min);
    vec3.set(
      blockCount,
      Math.ceil(blockCount[0] / voxelSize[0]),
      Math.ceil(blockCount[1] / voxelSize[1]),
      Math.ceil(blockCount[2] / voxelSize[2]),
    );
    console.log(blockCount);
    const chunks = vec3.fromValues(
      Math.ceil(blockCount[0] / chunkBlockCount[0]),
      Math.ceil(blockCount[1] / chunkBlockCount[1]),
      Math.ceil(blockCount[2] / chunkBlockCount[2]),
    );
    console.log(chunks);

    const voxels = createVoxelContainer();

    const aabb = mesh.aabb;
    const chunkAABB = BoundingBox.create();

    const tasks: Promise<any>[] = [];

    for (let z = 0; z < chunks[2]; ++z) {
      for (let y = 0; y < chunks[1]; ++y) {
        for (let x = 0; x < chunks[0]; ++x) {
          vec3.set(
            chunkAABB.min,
            aabb.min[0] + x * chunkSize[0],
            aabb.min[1] + y * chunkSize[1],
            aabb.min[2] + z * chunkSize[2],
          );
          vec3.add(chunkAABB.max, chunkAABB.min, chunkSize);

          tasks.push(
            workerPool
              .enqueue(ComputeFunctionKeys.ProcessChunk, {
                args: [x, y, z, BoundingBox.clone(chunkAABB)],
              })
              .then(
                ({ x, y, z, buffer }: { x: number; y: number; z: number; buffer: Uint8Array }) => {
                  const chunk = VoxelChunk.create();
                  chunk.buffer = buffer;
                  voxels.insert(x, y, z, chunk);
                },
              ),
          );
        }
      }
    }

    Promise.all(tasks).then(() => {
      res(voxels);
    });
  });
}
