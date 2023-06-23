import { vec3 } from 'gl-matrix';
import { get, writable, type Writable } from 'svelte/store';
import type { CameraType } from 'toolkit/camera/camera';
import type { CameraController } from 'toolkit/camera/cameraController';
import type { CameraControlType } from 'toolkit/camera/controls';

export interface CameraViewModel {
  cameraType: Writable<CameraType>;
  controlType: Writable<CameraControlType>;
  position: Writable<vec3>;
  target: Writable<vec3>;
  up: Writable<vec3>;

  destroy(): void;
}

export function createCameraViewModel(controller: CameraController): CameraViewModel {
  const cameraType = writable(controller.cameraType);
  const controlType = writable(controller.controlType);
  const position = writable(vec3.clone(controller.position));
  const target = writable(vec3.clone(controller.target));
  const up = writable(vec3.clone(controller.up));

  let unsubscribers: Unsubscriber[] = [
    controller.subscribe(() => {
      if (get(cameraType) !== controller.cameraType) {
        cameraType.set(controller.cameraType);
      }

      if (get(controlType) !== controller.controlType) {
        controlType.set(controller.controlType);
      }

      if (!vec3.equals(get(position), controller.position)) {
        position.set(vec3.clone(controller.position));
      }

      if (!vec3.equals(get(target), controller.target)) {
        target.set(vec3.clone(controller.target));
      }

      if (!vec3.equals(get(up), controller.up)) {
        up.set(vec3.clone(controller.up));
      }
    }),

    cameraType.subscribe((type) => {
      if (type !== controller.cameraType) {
        controller.cameraType = type;
      }
    }),

    controlType.subscribe((type) => {
      if (type !== controller.controlType) {
        controller.controlType = type;
      }
    }),

    position.subscribe((value) => {
      if (!vec3.equals(get(position), controller.position)) {
        controller.position = value;
      }
    }),

    target.subscribe((value) => {
      if (!vec3.equals(get(target), controller.target)) {
        controller.target = value;
      }
    }),

    up.subscribe((value) => {
      if (!vec3.equals(get(up), controller.up)) {
        controller.up = value;
      }
    }),
  ];

  return {
    cameraType,
    controlType,
    position,
    target,
    up,

    destroy() {
      unsubscribers.forEach((cb) => cb());
      unsubscribers = [];
    },
  };
}
