import type { vec3 } from 'gl-matrix';

export enum ComponentType {
  Transform = 1,
}

export interface BaseComponent {
  type: ComponentType;
}

/**
 * Transform
 */
export interface TransformComponent extends BaseComponent {
  type: ComponentType.Transform;

  position: vec3;
  rotation: vec3;
  scale: vec3;
}

export type Component = TransformComponent;
