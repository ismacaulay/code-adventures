import type { Buffer } from 'toolkit/rendering/buffers';
import {
  createIndexBuffer,
  type IndexBufferDescriptor,
} from 'toolkit/rendering/buffers/indexBuffer';
import {
  createUniformBuffer,
  UniformType,
  type UniformBufferDescriptor,
  type UniformDictionary,
} from 'toolkit/rendering/buffers/uniformBuffer';
import {
  createVertexBuffer,
  type VertexBufferDescriptor,
} from 'toolkit/rendering/buffers/vertexBuffer';

export enum DefaultBuffers {
  ViewProjection = 0,

  Count,
}

export interface BufferManager {
  createVertexBuffer(descriptor: VertexBufferDescriptor): number;
  createUniformBuffer(descriptor: UniformBufferDescriptor, initial?: UniformDictionary): number;
  createIndexBuffer(descriptor: IndexBufferDescriptor): number;

  get<T extends Buffer>(id: number): T;

  destroy(): void;
}

export function createBufferManager(device: GPUDevice): BufferManager {
  let storage: GenericObject<Buffer> = {};
  let next = DefaultBuffers.Count;

  return {
    createVertexBuffer(descriptor: VertexBufferDescriptor) {
      storage[next] = createVertexBuffer(device, descriptor);
      return next++;
    },

    createUniformBuffer(descriptor: UniformBufferDescriptor, initial?: UniformDictionary) {
      storage[next] = createUniformBuffer(device, descriptor, initial);
      return next++;
    },

    createIndexBuffer(descriptor: IndexBufferDescriptor) {
      storage[next] = createIndexBuffer(device, descriptor);
      return next++;
    },

    get<T extends Buffer>(id: number): T {
      let buffer = storage[id];

      if (!buffer) {
        if (id === DefaultBuffers.ViewProjection) {
          buffer = createUniformBuffer(device, {
            view: UniformType.Mat4,
            projection: UniformType.Mat4,
          });
          storage[id] = buffer;
        } else {
          throw new Error(`Unknown buffer: ${id}`);
        }
      }

      return buffer as T;
    },

    destroy() {
      Object.values(storage).forEach((buf: Buffer) => buf.destroy());
      storage = {};
    },
  };
}
