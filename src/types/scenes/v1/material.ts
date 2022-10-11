import type { vec3 } from 'gl-matrix';

export enum MaterialComponentTypeV1 {
  MeshBasicMaterial = 'MeshBasicMaterial',
}

interface BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1;
}

export interface MeshBasicMaterialV1 extends BaseMaterialComponentV1 {
  type: MaterialComponentTypeV1.MeshBasicMaterial;
  colour: vec3;
}

export type MaterialComponentV1 = MeshBasicMaterialV1;
