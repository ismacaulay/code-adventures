import {
  ComponentType,
  type Component,
  type GeometryComponent,
  type MaterialComponent,
  type ScriptComponent,
} from 'types/ecs/component';

export function isGeometryComponent(component: Component): component is GeometryComponent {
  return component.type === ComponentType.Geometry;
}

export function isMaterialComponent(component: Component): component is MaterialComponent {
  return component.type === ComponentType.Material;
}

export function isScriptComponent(component: Component): component is ScriptComponent {
  return component.type === ComponentType.Script;
}
