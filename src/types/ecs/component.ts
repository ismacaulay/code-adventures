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

export interface IndexBufferDescriptor {
  id?: number;
  array: Uint16Array | Uint32Array;
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

export interface VertexBufferDescriptor {
  id?: number;
  array: Float32Array | Float64Array;
  attributes: BufferAttribute[];
}

export interface MeshGeometryComponent extends BaseGeometryComponent {
  indices?: IndexBufferDescriptor;
  buffers: VertexBufferDescriptor[];
  count: number;
  instances: number;
}

export type GeometryComponent = MeshGeometryComponent;

export type Component = TransformComponent | GeometryComponent;
