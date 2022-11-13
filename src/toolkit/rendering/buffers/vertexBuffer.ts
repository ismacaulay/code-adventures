import { BufferType, type BaseBuffer } from './base';
import { createBuffer } from './common';

export interface VertexBuffer extends BaseBuffer {
  type: BufferType.Vertex;
  readonly data: Float32Array;

  layout: GPUVertexBufferLayout;
}

export enum BufferAttributeFormat {
  Float32 = 'float32',
  Float32x2 = 'float32x2',
  Float32x3 = 'float32x3',
}

export interface BufferAttribute {
  format: BufferAttributeFormat;
  location: number;
}

export enum VertexBufferStepMode {
  Vertex = 'vertex',
  Instance = 'instance',
}

export interface VertexBufferDescriptor {
  id?: number;
  array: Float32Array | Float64Array;
  stepMode?: VertexBufferStepMode;
  attributes: BufferAttribute[];
}

function getStrideForFormat(type: BufferAttributeFormat) {
  switch (type) {
    case BufferAttributeFormat.Float32:
      return 4;
    case BufferAttributeFormat.Float32x2:
      return 4 * 2;
    case BufferAttributeFormat.Float32x3:
      return 4 * 3;
  }
}

export function createVertexBuffer(
  device: GPUDevice,
  { array, stepMode = VertexBufferStepMode.Vertex, attributes }: VertexBufferDescriptor,
): VertexBuffer {
  let data: Float32Array;
  if (array instanceof Float64Array) {
    data = new Float32Array(array);
  } else {
    data = array;
  }
  const buffer = createBuffer(device, data, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

  const attrs: GPUVertexAttribute[] = [];
  let offset = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const { location, format } = attributes[i];
    attrs.push({
      shaderLocation: location,
      format,
      offset,
    });

    offset += getStrideForFormat(format);
  }

  return {
    type: BufferType.Vertex,

    buffer,
    data,
    layout: {
      arrayStride: offset,
      attributes: attrs,
      stepMode,
    },

    destroy() {
      buffer.destroy();
    },
  };
}
