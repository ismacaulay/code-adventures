import { vec3 } from 'gl-matrix';
import { createSignal } from 'toolkit/signal';
import { CameraType, type Camera } from './camera';
import { CameraControlType, type CameraControls } from './controls';
import { createFreeControls } from './freeControls';
import { createOrbitControls } from './orbitControls';
import { createOrthographicCamera } from './orthographic';
import { createPerspectiveCamera } from './perspective';

export interface CameraState {
  type: CameraType;
  target: vec3;
  position: vec3;
  up: vec3;
}

export interface CameraController {
  camera: Camera;

  cameraType: CameraType;
  controlType: CameraControlType;
  aspect: number;
  target: vec3;
  position: vec3;
  up: vec3;

  update(dt: number): void;
  destroy(): void;

  subscribe(cb: VoidFunction): Unsubscriber;
}

export function createCameraController(
  canvas: HTMLElement,
  initial: {
    type: CameraType;
    control: CameraControlType;
  } = { type: CameraType.Perspective, control: CameraControlType.Orbit },
): CameraController {
  const signal = createSignal();

  const orthographic = createOrthographicCamera({
    aspect: canvas.clientWidth / canvas.clientHeight,

    left: -2.5,
    right: 2.5,
    top: 2.5,
    bottom: -2.5,

    znear: 0.1,
    zfar: 1000,
  });

  const perspective = createPerspectiveCamera({
    aspect: canvas.clientWidth / canvas.clientHeight,
    fov: 45,
    znear: 0.1,
    zfar: 1000,
  });

  let currentType: CameraType = initial.type;
  let camera: Camera = currentType === CameraType.Orthographic ? orthographic : perspective;

  let currentControlType: CameraControlType;
  let controls: CameraControls;
  function setControlType(type: CameraControlType) {
    if (type === currentControlType) {
      return;
    }

    if (controls) {
      controls.destroy();
    }

    if (type === CameraControlType.Free) {
      controls = createFreeControls(canvas, { camera });
    } else if (type === CameraControlType.Orbit) {
      controls = createOrbitControls(canvas, { camera });
    } else {
      throw new Error(`[CameraController::setControlType] Unknown control type: ${type}`);
    }

    currentControlType = type;
    signal.emit();
  }
  setControlType(initial.control);

  return {
    get camera() {
      return camera;
    },

    get cameraType() {
      return currentType;
    },
    set cameraType(type) {
      if (type === currentType) {
        return;
      }

      const target = camera.target;
      const position = camera.position;
      const up = camera.up;
      const aspect = camera.aspect;

      camera = type === CameraType.Orthographic ? orthographic : perspective;

      vec3.copy(camera.target, target);
      vec3.copy(camera.position, position);
      vec3.copy(camera.up, up);
      camera.aspect = aspect;
      camera.updateViewMatrix();
      camera.updateProjectionMatrix();

      controls.camera = camera;
      currentType = type;

      signal.emit();
    },

    get controlType() {
      return currentControlType;
    },
    set controlType(value) {
      setControlType(value);
    },

    get aspect() {
      return camera.aspect;
    },
    set aspect(aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },

    get target() {
      return camera.target;
    },
    set target(target) {
      vec3.copy(camera.target, target);
      camera.updateViewMatrix();
    },

    get position() {
      return camera.position;
    },
    set position(position) {
      vec3.copy(camera.position, position);
      camera.updateViewMatrix();
    },

    get up() {
      return camera.up;
    },
    set up(up) {
      vec3.copy(camera.up, up);
      camera.updateViewMatrix();
    },

    update(dt) {
      controls.update(dt);
    },

    destroy() {
      controls.destroy();
      signal.destroy();
    },

    subscribe(cb: VoidFunction) {
      return signal.subscribe(cb);
    },
  };
}
