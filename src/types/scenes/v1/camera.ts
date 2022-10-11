import type { vec3 } from 'gl-matrix';

export enum CameraType {
  Orthographic = 'orthographic',
  Perspective = 'perspective',
}

export interface CameraV1 {
  type: CameraType;
  target: vec3;
  position: vec3;
  up: vec3;
}
