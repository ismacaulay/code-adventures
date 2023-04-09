import { vec2, vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import { intersectOctreeRay, type MeshOctree } from 'toolkit/geometry/octree';

export function createIsAABBInsideMesh(octree: MeshOctree) {
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

      if (intersectOctreeRay(octree, { origin, dir: samples[i] })) {
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
  let N = 50;

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
