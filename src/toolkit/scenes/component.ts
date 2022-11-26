import { GeometryComponentTypeV1, type GeometryComponentV1 } from 'types/scenes/v1/geometry';
import { MaterialComponentTypeV1, type MaterialComponentV1 } from 'types/scenes/v1/material';

export type ComponentV1 = GeometryComponentV1 | MaterialComponentV1;

export function isGeometryComponentV1(
  component: Maybe<ComponentV1>,
): component is GeometryComponentV1 {
  return (
    component !== undefined &&
    (component.type === GeometryComponentTypeV1.Obj ||
      component.type === GeometryComponentTypeV1.Mesh)
  );
}

export function isMaterialComponentV1(
  component: Maybe<ComponentV1>,
): component is MaterialComponentV1 {
  return (
    component !== undefined &&
    (component.type === MaterialComponentTypeV1.MeshBasicMaterial ||
      component.type === MaterialComponentTypeV1.MeshDiffuseMaterial ||
      component.type === MaterialComponentTypeV1.RawShaderMaterial)
  );
}
