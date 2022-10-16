import type { vec3 } from 'gl-matrix';
import type { CameraType } from 'toolkit/camera/camera';

export interface CameraV1 {
  type: CameraType;
  target: vec3;
  position: vec3;
  up: vec3;
}
