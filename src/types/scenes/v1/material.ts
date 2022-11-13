import type { vec3 } from 'gl-matrix';

export enum MaterialComponentTypeV1 {
  MeshBasicMaterial = 'MeshBasicMaterial',
  MeshDiffuseMaterial = 'MeshDiffuseMaterial',
}

interface BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1;
}

export interface MeshBasicMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshBasicMaterial;
  colour: vec3;
}

export interface MeshDiffuseMaterial extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshDiffuseMaterial;
  colour: vec3;
}

export type MaterialComponentV1 = MeshBasicMaterialV1;
