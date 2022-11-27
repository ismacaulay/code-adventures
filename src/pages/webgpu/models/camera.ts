import { get, writable, type Writable } from 'svelte/store';
import type { CameraType } from 'toolkit/camera/camera';
import type { CameraController } from 'toolkit/camera/cameraController';
import type { CameraControlType } from 'toolkit/camera/controls';

export interface CameraViewModel {
  cameraType: Writable<CameraType>;
  controlType: Writable<CameraControlType>;

  destroy(): void;
}

export function createCameraViewModel(controller: CameraController): CameraViewModel {
  const cameraType = writable(controller.cameraType);
  const controlType = writable(controller.controlType);

  let unsubscribers: Unsubscriber[] = [
    controller.subscribe(() => {
      if (get(cameraType) !== controller.cameraType) {
        cameraType.set(controller.cameraType);
      }

      if (get(controlType) !== controller.controlType) {
        controlType.set(controller.controlType);
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
  ];

  return {
    cameraType,
    controlType,

    destroy() {
      unsubscribers.forEach((cb) => cb());
      unsubscribers = [];
    },
  };
}
