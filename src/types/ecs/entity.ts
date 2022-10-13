import type { Component, ComponentType, GeometryComponent, TransformComponent } from './component';

// prettier-ignore
type GetComponentReturnType<T extends ComponentType> =
     T extends ComponentType.Transform ? Maybe<TransformComponent> :
     T extends ComponentType.Geometry ? Maybe<GeometryComponent> :
     never;

export interface EntityManager {
  add(uid: string): void;

  addComponent(uid: string, component: Component): void;

  getComponent<T extends ComponentType>(uid: string, type: T): GetComponentReturnType<T>;
}
