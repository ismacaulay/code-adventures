import type { vec3 } from 'gl-matrix';
import {
  ComponentType,
  MaterialComponentType,
  type MeshBasicMaterialComponent,
  type MeshDiffuseMaterialComponent,
} from 'types/ecs/component';

export function createMeshBasicMaterialComponent({
  colour,
}: {
  colour: vec3;
}): MeshBasicMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshBasic,

    colour,
  };
}

export function createMeshDiffuseMaterialComponent({
  colour,
}: {
  colour: vec3;
}): MeshDiffuseMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshDiffuse,

    colour,
  };
}
