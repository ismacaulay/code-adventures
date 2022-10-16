import type { vec3 } from 'gl-matrix';
import { CameraType, type Camera } from './camera';
import {createOrthographicCamera} from './orthographic';

export interface CameraState {
  type: CameraType;
  target: vec3;
  position: vec3;
  up: vec3;
}

export interface CameraController {
  camera: Camera;

  setCameraType(type: CameraType): void;
  update(dt: number): void;
}

export function createCameraController(initial: { type: CameraType }): CameraController {
  let camera: Camera;
    if (initial.type === CameraType.Orthographic) {
        camera = createOrthographicCamera();

  return {
    get camera() {
      return camera;
    },

    setCameraType(type) {},

    update(dt) {},
  };
}
