import type {
  Component,
  ComponentType,
  GeometryComponent,
  MaterialComponent,
  TransformComponent,
} from './component';

// prettier-ignore
type GetComponentReturnType<T extends ComponentType> =
  T extends ComponentType.Transform ? Maybe<TransformComponent> :
  T extends ComponentType.Geometry ? Maybe<GeometryComponent> :
  T extends ComponentType.Material ? Maybe<MaterialComponent> :
  never;

export interface EntityManager {
  add(uid: string): void;

  addComponent(uid: string, component: Component): void;

  getComponent<T extends ComponentType>(uid: string, type: T): GetComponentReturnType<T>;
}
