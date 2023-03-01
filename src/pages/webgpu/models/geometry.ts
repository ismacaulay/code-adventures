import { writable, type Writable } from 'svelte/store';
import type { GeometryComponent } from 'types/ecs/component';

export interface GeometryViewModel {
  triangles: number;
  buffers: number;
  showBoundingBox: Writable<boolean>;

  destroy(): void;
}

export function createGeometryViewModel(component: GeometryComponent): GeometryViewModel {
  let unsubscribers: Unsubscriber[] = [];

  const showBoundingBox = writable(component.showBoundingBox);

  unsubscribers.push(
    showBoundingBox.subscribe((value) => {
      if (value !== component.showBoundingBox) {
        component.showBoundingBox = value;
      }
    }),
  );

  return {
    triangles: component.count,
    buffers: component.buffers.length,
    showBoundingBox,

    destroy() {
      unsubscribers.forEach((cb) => cb());
      unsubscribers = [];
    },
  };
}
