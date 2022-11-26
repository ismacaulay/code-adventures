import { vec3 } from 'gl-matrix';
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

  setCameraType(type: CameraType): void;
  setControlType(type: CameraControlType): void;

  setAspect(value: number): void;
  setTarget(target: vec3): void;
  setPosition(position: vec3): void;
  setUp(up: vec3): void;

  update(dt: number): void;
  destroy(): void;
}

export function createCameraController(
  canvas: HTMLElement,
  initial: {
    type: CameraType;
    control: CameraControlType;
  } = { type: CameraType.Perspective, control: CameraControlType.Orbit },
): CameraController {
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
  }
  setControlType(initial.control);

  return {
    get camera() {
      return camera;
    },

    setCameraType(type) {
      if (type === currentType) {
        return;
      }

      const target = camera.target;
      const position = camera.position;
      const up = camera.up;
      const aspect = camera.aspect;

      currentType = type;
      camera = currentType === CameraType.Orthographic ? orthographic : perspective;

      vec3.copy(camera.target, target);
      vec3.copy(camera.position, position);
      vec3.copy(camera.up, up);
      camera.aspect = aspect;
      camera.updateViewMatrix();
      camera.updateProjectionMatrix();

      controls.camera = camera;
    },
    setControlType,

    setAspect(aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    setTarget(target) {
      vec3.copy(camera.target, target);
      camera.updateViewMatrix();
    },
    setPosition(position) {
      vec3.copy(camera.position, position);
      camera.updateViewMatrix();
    },
    setUp(up) {
      vec3.copy(camera.up, up);
      camera.updateViewMatrix();
    },

    update(dt) {
      controls.update(dt);
    },

    destroy() {
      controls.destroy();
    },
  };
}
