import type { vec3 } from 'gl-matrix';

export enum RendererType {
  Default = 'default',
  WeightedBlended = 'weighted-blended',
}

export interface Renderer {
  type: RendererType;
  clearColour: vec3;
}
