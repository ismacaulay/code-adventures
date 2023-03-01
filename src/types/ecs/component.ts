import type { mat4, vec3 } from 'gl-matrix';
import type { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { Rotation } from 'toolkit/math/rotation';
import type { IndexBufferDescriptor } from 'toolkit/rendering/buffers/indexBuffer';
import type { UniformDictionary } from 'toolkit/rendering/buffers/uniformBuffer';
import type { VertexBufferDescriptor } from 'toolkit/rendering/buffers/vertexBuffer';
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

export interface MeshGeometryComponent extends BaseGeometryComponent {
  boundingBox: BoundingBox;
  indices?: IndexBufferDescriptor;
  buffers: VertexBufferDescriptor[];
  count: number;
  instances: number;

  showBoundingBox: boolean;
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
