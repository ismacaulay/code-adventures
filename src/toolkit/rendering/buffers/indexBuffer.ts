import { BufferType, type BaseBuffer } from './base';
import { createBuffer } from './common';

export interface IndexBuffer extends BaseBuffer {
  type: BufferType.Index;
  readonly data: Uint16Array | Uint32Array;

  format: GPUIndexFormat;
}

export interface IndexBufferDescriptor {
  id?: number;
  array: Uint16Array | Uint32Array;
}

export function createIndexBuffer(
  device: GPUDevice,
  descriptor: IndexBufferDescriptor,
): IndexBuffer {
  const format: GPUIndexFormat = descriptor.array instanceof Uint16Array ? 'uint16' : 'uint32';
  const data = descriptor.array;
  const buffer = createBuffer(device, data, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

  return {
    type: BufferType.Index,

    buffer,
    data,
    format,

    destroy() {
      buffer.destroy();
    },
  };
}
