import {
  ComponentType,
  type Component,
  type GeometryComponent,
  type MaterialComponent,
} from 'types/ecs/component';

export function isGeometryComponent(component: Component): component is GeometryComponent {
  return component.type === ComponentType.Geometry;
}

export function isMaterialComponent(component: Component): component is MaterialComponent {
  return component.type === ComponentType.Material;
}
