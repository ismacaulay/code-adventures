import ComputeWorker from './meshGenerator.worker?worker';

import { VoxelChunk, type VoxelContainer } from 'toolkit/geometry/voxel';
import { createWorkerPool } from 'toolkit/workers/workerPool';
import type { vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import { createDynamicFloat64Array } from 'toolkit/array';

enum ComputeFunctionKeys {
  GenerateMeshForChunk = 'generateMeshForChunk',
}

type ComputeFunctions = {
  [ComputeFunctionKeys.GenerateMeshForChunk]: () => {};
};

export async function generateMeshFromVoxels(
  voxels: VoxelContainer,
  voxelSize: vec3,
  aabb: BoundingBox,
) {
  const workerPool = createWorkerPool<ComputeFunctions>(function createWorker() {
    return new ComputeWorker();
  });

  return new Promise(function generateMesh(res) {
    const tasks: Promise<any>[] = [];
    const chunkAABB = BoundingBox.create();
    const chunkSize: vec3 = [
      voxelSize[0] * VoxelChunk.CHUNK_SIZE[0],
      voxelSize[1] * VoxelChunk.CHUNK_SIZE[1],
      voxelSize[2] * VoxelChunk.CHUNK_SIZE[2],
    ];
    const buffers = [
      createDynamicFloat64Array()
    ]
    let buffer = buffers[0];

    for (const [{ i, j, k }, chunk] of voxels.storage.entries()) {
      if (chunk.isEmpty()) {
        continue;
      }

      chunkAABB.min[0] = aabb.min[0] + i * chunkSize[0];
      chunkAABB.min[1] = aabb.min[1] + j * chunkSize[1];
      chunkAABB.min[2] = aabb.min[2] + k * chunkSize[2];

      // TODO: Dont need this
      chunkAABB.max[0] = chunkAABB.min[0] + chunkSize[0];
      chunkAABB.max[1] = chunkAABB.min[1] + chunkSize[1];
      chunkAABB.max[2] = chunkAABB.min[2] + chunkSize[2];

      tasks.push(
        workerPool
          .enqueue(ComputeFunctionKeys.GenerateMeshForChunk, {
            args: [i, j, k, voxelSize, chunk.buffer, BoundingBox.clone(chunkAABB)],
          })
          .then((mesh) => {
            if (mesh) {
              if (buffer.length >= 9000000) {
                buffer = createDynamicFloat64Array();
                buffers.push(buffer);
              }
              buffer.append(mesh.vertices);
            }
          }),
      );
    }

    Promise.all(tasks).then(() => {
      workerPool.destroy();
      res(buffers);
    });
  });
}
