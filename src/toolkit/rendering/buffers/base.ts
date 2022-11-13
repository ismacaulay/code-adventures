export enum BufferType {
  Vertex,
  Index,
  Uniform,
}

export interface BaseBuffer {
  type: BufferType;

  readonly buffer: GPUBuffer;

  destroy(): void;
}
