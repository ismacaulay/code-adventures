import type { vec3 } from 'gl-matrix';
import type { UniformDictionary } from 'toolkit/rendering/buffers/uniformBuffer';

export enum MaterialComponentTypeV1 {
  MeshBasicMaterial = 'MeshBasicMaterial',
  MeshDiffuseMaterial = 'MeshDiffuseMaterial',
  RawShaderMaterial = 'RawShaderMaterial',
}

interface BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1;
}

export interface MeshBasicMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshBasicMaterial;
  colour: vec3;
}

export interface MeshDiffuseMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshDiffuseMaterial;
  colour: vec3;
}

interface BaseRawShaderMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.RawShaderMaterial;

  uniforms: UniformDictionary;
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

export type MaterialComponentV1 = MeshBasicMaterialV1 | MeshDiffuseMaterialV1 | RawShaderMaterialV1;
