import type { vec3 } from 'gl-matrix';
import type { UniformType, UniformValue } from 'toolkit/rendering/buffers/uniformBuffer';
import type { TextureV1 } from 'toolkit/rendering/textures';

export enum MaterialComponentTypeV1 {
  MeshBasicMaterial = 'basic',
  MeshDiffuseMaterial = 'diffuse',
  MeshPhongMaterial = 'phong',
  RawShaderMaterial = 'shader',
}

interface BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1;
  base?: string;
  transparent?: boolean;
}

export interface MeshBasicMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshBasicMaterial;
  colour: vec3;
}

export interface MeshDiffuseMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshDiffuseMaterial;
  colour: vec3;
}

export interface MeshPhongMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshPhongMaterial;

  diffuse: vec3;
  specular: vec3;
  shininess: number;
}

interface UniformDictionaryV1 {
  [key: string]: UniformType | UniformValue | UniformDictionaryV1;
}

interface BaseRawShaderMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.RawShaderMaterial;

  uniforms: UniformDictionaryV1;
  textures: TextureV1[];
  blend?: GPUBlendState;
}

export interface SingleSourceRawShaderMaterialV1 extends BaseRawShaderMaterialV1 {
  source: string;
  vertex: { entryPoint: string };
  fragment: { entryPoint: string };
}

export interface MultiSourceRawShaderMaterialV1 extends BaseRawShaderMaterialV1 {
  vertex: { entryPoint: string; source: string };
  fragment: { entryPoint: string; source: string };
}

export type RawShaderMaterialV1 = SingleSourceRawShaderMaterialV1 | MultiSourceRawShaderMaterialV1;

export type MaterialComponentV1 =
  | MeshBasicMaterialV1
  | MeshDiffuseMaterialV1
  | MeshPhongMaterialV1
  | RawShaderMaterialV1;
