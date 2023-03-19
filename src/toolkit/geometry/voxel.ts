import { vec3 } from 'gl-matrix';

export interface VoxelChunk {
  addVoxel(i: number, j: number, k: number): void;
  isEmpty(): boolean;
  hasVoxel(i: number, j: number, k: number): boolean;
}

export module VoxelChunk {
  export const CHUNK_SIZE = vec3.fromValues(16, 16, 16);

  function index(i: number, j: number, k: number) {
    return k * CHUNK_SIZE[1] * CHUNK_SIZE[2] + j * CHUNK_SIZE[2] + i;
  }

  export function create(): VoxelChunk {
    // TODO: should be able to just use a single bit per voxel entry
    let buffer: Maybe<Uint8Array> = undefined;

    return {
      addVoxel(i: number, j: number, k: number) {
        if (!buffer) {
          buffer = new Uint8Array(CHUNK_SIZE[0] * CHUNK_SIZE[1] * CHUNK_SIZE[2]);
        }

        const voxelIdx = index(i, j, k);
        buffer[voxelIdx] = 1;
      },

      isEmpty() {
        if (!buffer) {
          return true;
        }

        for (let i = 0; i < buffer.length; ++i) {
          if ((buffer[i] & 0xff) !== 0) {
            return false;
          }
        }

        return true;
      },

      hasVoxel(i: number, j: number, k: number) {
        if (!buffer) {
          return false;
        }

        const voxelIdx = index(i, j, k);
        return buffer[voxelIdx] === 1;
      },
    };
  }
}

export function createVoxelContainer() {
  const storage = new Map<{ i: number; j: number; k: number }, VoxelChunk>();

  return {
    storage,
    insert(i: number, j: number, k: number, chunk: VoxelChunk) {
      storage.set({ i, j, k }, chunk);
    },

    get(i: number, j: number, k: number): Maybe<VoxelChunk> {
      return storage.get({ i, j, k });
    },

    has(i: number, j: number, k: number): boolean {
      return storage.has({ i, j, k });
    },
  };
}
