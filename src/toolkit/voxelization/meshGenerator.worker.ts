import { vec3 } from 'gl-matrix';
import { VoxelChunk } from 'toolkit/geometry/voxel';

onmessage = function handleWorkerMessage(msg: MessageEvent) {
  const { data } = msg;
  const { workerId, name, args } = data;

  if (name !== 'generateMeshForChunk') {
    (postMessage as any)({ workerId, result: undefined });
    return;
  }

  const [
    x,
    y,
    z,
    voxelSize,
    chunkBuffer,
    chunkAABB,
    prevIBuffer,
    nextIBuffer,
    prevJBuffer,
    nextJBuffer,
    prevKBuffer,
    nextKBuffer,
  ] = args;

  const chunk = VoxelChunk.create();
  chunk.buffer = chunkBuffer;

  const prevI = VoxelChunk.create();
  prevI.buffer = prevIBuffer;
  const nextI = VoxelChunk.create();
  nextI.buffer = nextIBuffer;
  const prevJ = VoxelChunk.create();
  prevJ.buffer = prevJBuffer;
  const nextJ = VoxelChunk.create();
  nextJ.buffer = nextJBuffer;
  const prevK = VoxelChunk.create();
  prevK.buffer = prevKBuffer;
  const nextK = VoxelChunk.create();
  nextK.buffer = nextKBuffer;

  if (chunk.isEmpty()) {
    (postMessage as any)({ workerId, result: undefined });
    return;
  }

  // TODO: use a growable buffer?
  const vertices: number[] = [];
  const corner = vec3.create();
  const min = chunkAABB.min;

  // TODO: what if the chunk is full? then we just need
  //       to do the exterior faces
  for (let k = 0; k < VoxelChunk.CHUNK_SIZE[2]; ++k) {
    for (let j = 0; j < VoxelChunk.CHUNK_SIZE[1]; ++j) {
      for (let i = 0; i < VoxelChunk.CHUNK_SIZE[0]; ++i) {
        if (!chunk.hasVoxel(i, j, k)) {
          continue;
        }

        corner[0] = min[0] + i * voxelSize[0];
        corner[1] = min[1] + j * voxelSize[1];
        corner[2] = min[2] + k * voxelSize[2];

        if (
          (i === 0 && !prevI.hasVoxel(VoxelChunk.CHUNK_SIZE[0] - 1, j, k)) ||
          (i !== 0 && !chunk.hasVoxel(i - 1, j, k))
        ) {
          // push vertices on y-z plane, moving along i
          // prettier-ignore
          vertices.push(
            corner[0], corner[1], corner[2],
            corner[0], corner[1] + voxelSize[1], corner[2],
            corner[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],

            corner[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0], corner[1], corner[2] + voxelSize[2],
            corner[0], corner[1], corner[2],
          );
        }

        if (
          (j === 0 && !prevJ.hasVoxel(i, VoxelChunk.CHUNK_SIZE[1] - 1, k)) ||
          (j !== 0 && !chunk.hasVoxel(i, j - 1, k))
        ) {
          // push vertices x-z plane, moving along j
          // prettier-ignore
          vertices.push(
            corner[0], corner[1], corner[2],
            corner[0], corner[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1], corner[2] + voxelSize[2],

            corner[0] + voxelSize[0], corner[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1], corner[2],
            corner[0], corner[1], corner[2],
          );
        }

        if (
          (k === 0 && !prevK.hasVoxel(i, j, VoxelChunk.CHUNK_SIZE[2] - 1)) ||
          (k !== 0 && !chunk.hasVoxel(i, j, k - 1))
        ) {
          // push vertices on x-y plane, moving along k
          // prettier-ignore
          vertices.push(
            corner[0], corner[1], corner[2],
            corner[0] + voxelSize[0], corner[1], corner[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2],

            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2],
            corner[0], corner[1] + voxelSize[1], corner[2],
            corner[0], corner[1], corner[2],
          );
        }

        if (
          (i === VoxelChunk.CHUNK_SIZE[0] - 1 && !nextI.hasVoxel(0, j, k)) ||
          (i !== VoxelChunk.CHUNK_SIZE[0] - 1 && !chunk.hasVoxel(i + 1, j, k))
        ) {
          // push vertices on y-z plane, at the end of i
          // prettier-ignore
          vertices.push(
            corner[0] + voxelSize[0], corner[1], corner[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],

            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1], corner[2],
          );
        }

        if (
          (j === VoxelChunk.CHUNK_SIZE[1] - 1 && !nextJ.hasVoxel(i, 0, k)) ||
          (j !== VoxelChunk.CHUNK_SIZE[1] - 1 && !chunk.hasVoxel(i, j + 1, k))
        ) {
          // push vertices on x-z plane, at the end of j
          // prettier-ignore
          vertices.push(
            corner[0], corner[1] + voxelSize[1], corner[2],
            corner[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],

            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2],
            corner[0], corner[1] + voxelSize[1], corner[2],
          );
        }

        if (
          (k === VoxelChunk.CHUNK_SIZE[2] - 1 && !nextK.hasVoxel(i, j, 0)) ||
          (k !== VoxelChunk.CHUNK_SIZE[2] - 1 && !chunk.hasVoxel(i, j, k + 1))
        ) {
          // push vertices on x-y plane, at the end of k
          // prettier-ignore
          vertices.push(
            corner[0], corner[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1], corner[2] + voxelSize[2],
            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],

            corner[0] + voxelSize[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0], corner[1] + voxelSize[1], corner[2] + voxelSize[2],
            corner[0], corner[1], corner[2] + voxelSize[2],
          );
        }
      }
    }
  }

  const buffer = new Float64Array(vertices);
  (postMessage as any)({ workerId, result: { x, y, z, vertices: buffer } }, [buffer.buffer]);
};

export default null;
