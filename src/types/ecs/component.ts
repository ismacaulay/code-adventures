import type { mat4, vec3 } from 'gl-matrix';
import type { Rotation } from 'toolkit/math/rotation';
import type { UniformDictionary } from 'toolkit/rendering/buffers/uniformBuffer';
import type { ShaderDescriptor } from 'toolkit/rendering/shader';

export enum ComponentType {
  Transform = 1,
  Geometry = 2,
  Material = 4,
  Script = 8,
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
  rotation: Rotation;
  scale: vec3;

  updateMatrix(): void;
  readonly matrix: mat4;
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

/**
 * Material
 */
export interface BasicMaterialComponent extends BaseComponent {
  type: ComponentType.Material;

  shader: ShaderDescriptor;
  uniforms: UniformDictionary;
}

export enum MaterialComponentType {
  MeshBasic,
  MeshDiffuse,
  MeshPhong,
  RawShader,
}

export type WeightedBlendedShaderId = { opaque: number; transparent: number };
export type ShaderId = number | WeightedBlendedShaderId;

export function isWeightedBlendedShaderId(id: any): id is WeightedBlendedShaderId {
  return id !== undefined && 'opaque' in id && 'transparent' in id;
}

interface BaseMaterialComponent extends BaseComponent {
  type: ComponentType.Material;
  subtype: MaterialComponentType;

  transparent: boolean;
}

export interface MeshBasicMaterialComponent extends BaseMaterialComponent {
  subtype: MaterialComponentType.MeshBasic;

  shader?: ShaderId;

  opacity: number;
  colour: vec3;
}

export interface MeshDiffuseMaterialComponent extends BaseMaterialComponent {
  subtype: MaterialComponentType.MeshDiffuse;

  shader?: ShaderId;

  opacity: number;
  colour: vec3;
}

export interface MeshPhongMaterialComponent extends BaseMaterialComponent {
  subtype: MaterialComponentType.MeshPhong;

  shader?: number;
  diffuse: vec3;
  specular: vec3;
  shininess: number;
}

export interface RawShaderMaterialComponent extends BaseMaterialComponent {
  subtype: MaterialComponentType.RawShader;

  shader?: number;
  descriptor: ShaderDescriptor;
  uniforms?: UniformDictionary;
}

export type MaterialComponent =
  | MeshBasicMaterialComponent
  | MeshDiffuseMaterialComponent
  | MeshPhongMaterialComponent
  | RawShaderMaterialComponent;

/**
 * Script
 */
export interface ScriptComponent {
  type: ComponentType.Script;

  script?: number;
  location: string;
}

export type Component =
  | TransformComponent
  | GeometryComponent
  | MaterialComponent
  | ScriptComponent;
