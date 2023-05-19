import type { mat4, vec3 } from 'gl-matrix';

export enum CameraType {
  Perspective = 'perspective',
  Orthographic = 'orthographic',
}

export interface BaseCamera {
  type: CameraType;

  view: mat4;
  projection: mat4;
  viewProjection: mat4;

  aspect: number;
  znear: number;
  zfar: number;

  position: vec3;
  target: vec3;
  up: vec3;

  lookat(eye: vec3, target: vec3, up: vec3): void;

  updateViewMatrix(): void;
  updateProjectionMatrix(): void;
}

export interface PerspectiveCamera extends BaseCamera {
  type: CameraType.Perspective;

  fov: number;
}

export interface OrthographicCamera extends BaseCamera {
  type: CameraType.Orthographic;

  left: number;
  right: number;
  top: number;
  bottom: number;

  zoom: number;
}

export type Camera = PerspectiveCamera | OrthographicCamera;
