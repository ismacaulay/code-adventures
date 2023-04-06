import { vec3 } from 'gl-matrix';

export enum VoxelState {
  Outside = 0,
  Intersects = 1,
  Inside = 2,
}

export interface VoxelChunk {
  addVoxel(i: number, j: number, k: number, state: VoxelState): void;
  isEmpty(): boolean;
  hasVoxel(i: number, j: number, k: number): boolean;
  setAllVoxels(state: VoxelState): void;
}

export module VoxelChunk {
  export const CHUNK_SIZE = vec3.fromValues(16, 16, 16);

  function index(i: number, j: number, k: number) {
    return k * CHUNK_SIZE[1] * CHUNK_SIZE[2] + j * CHUNK_SIZE[2] + i;
  }

  export function create(): VoxelChunk {
    // TODO: should be able to just use a single bit per voxel entry
    let buffer: Maybe<Uint8Array> = undefined;
    let isEmpty = true;

    return {
      addVoxel(i: number, j: number, k: number, state: VoxelState) {
        if (!buffer) {
          buffer = new Uint8Array(CHUNK_SIZE[0] * CHUNK_SIZE[1] * CHUNK_SIZE[2]);
        }

        const voxelIdx = index(i, j, k);
        buffer[voxelIdx] = state;
        isEmpty = false;

        // TODO: should we track if full?
        // for (let i = 0; i < buffer.length; ++i) {
        //   if ((buffer[i] & 0xff) !== 0) {
        //     return false;
        //   }
        // }
      },

      isEmpty() {
        return isEmpty;
      },

      hasVoxel(i: number, j: number, k: number) {
        if (!buffer) {
          return false;
        }

        const voxelIdx = index(i, j, k);
        return buffer[voxelIdx] !== VoxelState.Outside;
      },

      setAllVoxels(state: VoxelState) {
        if (!buffer) {
          buffer = new Uint8Array(CHUNK_SIZE[0] * CHUNK_SIZE[1] * CHUNK_SIZE[2]);
        }
        buffer.fill(state);

        isEmpty = state !== VoxelState.Outside;
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
