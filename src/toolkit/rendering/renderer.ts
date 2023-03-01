import type { vec3 } from 'gl-matrix';
import type { CopyToTextureCommand, DrawCommand, WriteBufferCommand } from './commands';

export enum RendererType {
  Default = 'default',
  WeightedBlended = 'weighted-blended',
}

export interface Renderer {
  type: RendererType;
  clearColour: vec3;

  begin(): void;
  submit(command: DrawCommand | WriteBufferCommand | CopyToTextureCommand): void;
  end(): void;
}
