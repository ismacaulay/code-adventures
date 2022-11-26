import type { vec3 } from 'gl-matrix';

export interface AxisRotation {
  axis: vec3;
  angle: number;
}

export type Rotation = vec3 | AxisRotation;

export function isAxisRotation(rotation: Rotation): rotation is AxisRotation {
  return 'axis' in rotation && 'angle' in rotation;
}
