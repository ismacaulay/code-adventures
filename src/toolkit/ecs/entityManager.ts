import type { Component, ComponentType } from 'types/ecs/component';
import type { EntityManager } from 'types/ecs/entity';

export function createEntityManager(): EntityManager {
  const entities = new Map<string, Map<ComponentType, Component>>();

  return {
    add(uid: string) {
      if (entities.has(uid)) {
        return;
      }

      entities.set(uid, new Map());
    },

    addComponent(uid, component) {
      const components = entities.get(uid);
      if (!components) {
        throw new Error(`[EntityManager::addComponent] unknown entity: ${uid}`);
      }

      components.set(component.type, component);
    },
  };
}
