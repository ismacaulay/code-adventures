import { mat4, vec3 } from 'gl-matrix';
import { CameraType } from './camera';
import type { PerspectiveCamera } from './camera';

interface PerspectiveCameraParams {
  fov: number;
  znear: number;
  zfar: number;
  aspect: number;
}

export function createPerspectiveCamera(params: PerspectiveCameraParams): PerspectiveCamera {
  const _target = vec3.fromValues(0, 0, 0);
  const _position = vec3.fromValues(0, 0, 0);
  const _up = vec3.fromValues(0, 1, 0);

  let fov = params.fov;
  let znear = params.znear;
  let zfar = params.zfar;
  let aspect = params.aspect;

  const view = mat4.create();
  const projection = mat4.create();

  let vpNeedsUpdate = false;
  const viewProjection = mat4.create();

  function lookat(eye: vec3, target: vec3, up: vec3) {
    vec3.copy(_position, eye);
    vec3.copy(_target, target);
    vec3.copy(_up, up);

    mat4.lookAt(view, eye, target, up);
    vpNeedsUpdate = true;
  }

  function updateViewMatrix() {
    lookat(_position, _target, _up);
  }

  function updateProjectionMatrix() {
    mat4.perspectiveZO(projection, (fov * Math.PI) / 180.0, aspect, znear, zfar);
    vpNeedsUpdate = true;
  }

  updateViewMatrix();
  updateProjectionMatrix();

  return {
    type: CameraType.Perspective,

    view,
    projection,
    get viewProjection() {
      if (vpNeedsUpdate) {
        mat4.multiply(viewProjection, projection, view);
        vpNeedsUpdate = false;
      }
      return viewProjection;
    },

    get fov() {
      return fov;
    },
    set fov(value: number) {
      fov = value;
    },

    get znear() {
      return znear;
    },
    set znear(value: number) {
      znear = value;
    },

    get zfar() {
      return zfar;
    },
    set zfar(value: number) {
      zfar = value;
    },

    get aspect() {
      return aspect;
    },
    set aspect(value: number) {
      aspect = value;
    },

    get position() {
      return _position;
    },
    get target() {
      return _target;
    },
    get up() {
      return _up;
    },

    lookat,
    updateViewMatrix,
    updateProjectionMatrix,
  };
}
