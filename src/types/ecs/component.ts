import type { vec3 } from 'gl-matrix';

export enum ComponentType {
  Transform = 1,
  Geometry = 2,
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

/**
 * Geometry
 */
export interface BaseGeometryComponent extends BaseComponent {
  type: ComponentType.Geometry;
}

export interface MeshGeometryComponent extends BaseGeometryComponent {}

export type GeometryComponent = MeshGeometryComponent;

export type Component = TransformComponent | GeometryComponent;
