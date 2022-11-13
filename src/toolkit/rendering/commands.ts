import type { IndexBuffer } from './buffers/indexBuffer';
import type { VertexBuffer } from './buffers/vertexBuffer';
import type { Shader } from './shader';

export enum CommandType {
  Draw = 'draw',
  WriteBuffer = 'writeBuffer',
}

interface BaseCommand {
  type: CommandType;
}

export interface DrawCommand extends BaseCommand {
  type: CommandType.Draw;
  shader: Shader;
  indices?: IndexBuffer;
  buffers: VertexBuffer[];
  count: number;
  instances: number;
}

export interface WriteBufferCommand extends BaseCommand {
  type: CommandType.WriteBuffer;
  src: Float32Array | Float64Array | Uint16Array | Uint32Array;
  dst: GPUBuffer;
}
