import { vec3 } from 'gl-matrix';

export enum VoxelState {
  Outside = 0,
  Intersects = 1,
  Inside = 2,
}

export type VoxelChunk = {
  buffer: Uint8Array | undefined;

  addVoxel(i: number, j: number, k: number, state: VoxelState): void;
  isEmpty(): boolean;
  hasVoxel(i: number, j: number, k: number): boolean;
  setAllVoxels(state: VoxelState): void;
};

// TODO: Alot of these can be made, should we change this to a Class?
export module VoxelChunk {
  // TODO: What is the most optimal chunk size? or is it different
  //       for different block counts?
  // export const CHUNK_SIZE = vec3.fromValues(16, 16, 16);
  export const CHUNK_SIZE = vec3.fromValues(8, 8, 8);
  // export const CHUNK_SIZE = vec3.fromValues(4, 4, 4);

  function index(i: number, j: number, k: number) {
    // return k * CHUNK_SIZE[1] * CHUNK_SIZE[2] + j * CHUNK_SIZE[2] + i;
    return k * CHUNK_SIZE[0] * CHUNK_SIZE[1] + j * CHUNK_SIZE[0] + i;
  }

  export function create(): VoxelChunk {
    // TODO: should be able to just use a single bit per voxel entry
    let buffer: Maybe<Uint8Array> = undefined;
    let isEmpty = true;

    return {
      get buffer() {
        return buffer;
      },
      set buffer(buf: Uint8Array | undefined) {
        if (!buf) {
          buffer = undefined;
          isEmpty = true;
          return;
        }

        if (buf.length === 0) {
          buffer = undefined;
          isEmpty = true;
        } else if (buf.length !== CHUNK_SIZE[0] * CHUNK_SIZE[1] * CHUNK_SIZE[2]) {
          throw new Error('Buffer is the wrong size');
        }

        buffer = buf;
        isEmpty = true;
        for (let i = 0; i < buffer.length; ++i) {
          if (buffer[i] !== 0) {
            isEmpty = false;
            break;
          }
        }
      },

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
        if (!buffer || isEmpty) {
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

export function createVoxelContainer(chunkCount: vec3) {
  const storage = new Map<number, VoxelChunk>();

  function key(i: number, j: number, k: number) {
    return k * chunkCount[0] * chunkCount[1] + j * chunkCount[0] + i;
  }

  function valid(i: number, j: number, k: number) {
    return (
      0 <= i && i < chunkCount[0] && 0 <= j && j < chunkCount[1] && 0 <= k && k < chunkCount[2]
    );
  }

  return {
    storage,
    chunkCount,

    insert(i: number, j: number, k: number, chunk: VoxelChunk) {
      if (!valid(i, j, k)) throw new Error(`Invalid chunk index: ${i}, ${j}, ${k}`);
      const chunkKey = key(i, j, k);
      if (storage.has(chunkKey)) throw new Error(`Already have voxel: ${i}, ${j}, ${k}`);

      storage.set(chunkKey, chunk);
    },

    get(i: number, j: number, k: number): Maybe<VoxelChunk> {
      if (!valid(i, j, k)) return undefined;

      return storage.get(key(i, j, k));
    },

    has(i: number, j: number, k: number): boolean {
      if (!valid(i, j, k)) return false;

      return storage.has(key(i, j, k));
    },
  };
}
export type VoxelContainer = ReturnType<typeof createVoxelContainer>;
