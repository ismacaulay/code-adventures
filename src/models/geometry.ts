import { writable, type Writable } from 'svelte/store';
import type { BoundingBox } from 'toolkit/geometry/boundingBox';
import { GeometryComponentType, type GeometryComponent } from 'types/ecs/component';

export type BufferGeometryViewModel = {
  type: GeometryComponentType.Buffer;

  triangles: number;
  buffers: number;

  boundingBox: BoundingBox;
  showBoundingBox: Writable<boolean>;

  destroy(): void;
};

export type ClusterGeometryViewModel = {
  type: GeometryComponentType.Cluster;

  clusters: number;

  boundingBox: BoundingBox;
  showBoundingBox: Writable<boolean>;

  showClusterBoundingSpheres: Writable<boolean>;

  destroy(): void;
};

export type GeometryViewModel = BufferGeometryViewModel | ClusterGeometryViewModel;

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

  if (component.subtype === GeometryComponentType.Buffer) {
    return {
      type: component.subtype,
      triangles: component.count / 3,
      buffers: component.buffers.length,
      boundingBox: component.boundingBox,
      showBoundingBox,

      destroy() {
        unsubscribers.forEach((cb) => cb());
        unsubscribers = [];
      },
    };
  } else if (component.subtype === GeometryComponentType.Cluster) {
    const showClusterBoundingSpheres = writable(false);

    unsubscribers.push(
      showClusterBoundingSpheres.subscribe((value) => {
        // if (value !== component.showBoundingBox) {
        //   component.showBoundingBox = value;
        // }
      }),
    );

    return {
      type: component.subtype,

      clusters: component.clusters.count,
      boundingBox: component.boundingBox,
      showBoundingBox,
      showClusterBoundingSpheres,

      destroy() {
        unsubscribers.forEach((cb) => cb());
        unsubscribers = [];
      },
    };
  }

  throw new Error(`Unknown geometry component type: ${(component as any).subtype}`);
}
