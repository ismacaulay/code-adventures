import type { Component } from './component';

export interface EntityManager {
  add(uid: string): void;

  addComponent(uid: string, component: Component): void;
}
