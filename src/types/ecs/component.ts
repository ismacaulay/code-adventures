import type { mat4, vec3 } from 'gl-matrix';
import type { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { Rotation } from 'toolkit/math/rotation';
import type { Sphere } from 'toolkit/math/sphere';
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
export enum GeometryComponentType {
  Buffer = 0,
  Cluster = 1,
}

export interface BaseGeometryComponent extends BaseComponent {
  type: ComponentType.Geometry;
  subtype: GeometryComponentType;

  boundingBox: BoundingBox;
  showBoundingBox: boolean;

  boundingSphere: Sphere;
}

export interface MeshGeometryComponent extends BaseGeometryComponent {
  subtype: GeometryComponentType.Buffer;

  indices?: IndexBufferDescriptor;
  buffers: VertexBufferDescriptor[];
  count: number;
  instances: number;
}

export interface ClusterGeometryComponent extends BaseGeometryComponent {
  subtype: GeometryComponentType.Cluster;

  clusters: {
    counts: Uint32Array;
    bounds: Float32Array | Float64Array;
    indices: Uint32Array;
    vertices: Float32Array | Float64Array;

    attributes: VertexBufferDescriptor[];
  };
}

export type GeometryComponent = MeshGeometryComponent | ClusterGeometryComponent;

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
  LineBasic,
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

export interface LineBasicMaterial extends BaseMaterialComponent {
  subtype: MaterialComponentType.LineBasic;

  shader?: ShaderId;

  opacity: number;
  colour: vec3;
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
  | LineBasicMaterial
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
