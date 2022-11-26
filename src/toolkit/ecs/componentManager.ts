import type { Component } from 'types/ecs/component';

export interface ComponentManager {
  add(uid: string, component: Component): void;
  get<T extends Component>(uid: string): T;
  destroy(): void;
}

export function createComponentManager(): ComponentManager {
  let storage: GenericObject<Component> = {};

  return {
    add(uid: string, component: Component) {
      storage[uid] = component;
    },
    get<T extends Component>(uid: string) {
      const component = storage[uid];
      if (!component) {
        throw new Error(`[ComponentManager::get] Unknown component: ${uid}`);
      }

      return component as T;
    },
    destroy() {
      storage = {};
    },
  };
}
