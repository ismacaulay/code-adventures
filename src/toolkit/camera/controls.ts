import type { Camera } from './camera';

export enum CameraControlType {
  Free = 'free',
  Orbit = 'orbit',
}

export interface CameraControls {
  type: CameraControlType;
  update(dt: number): void;
  camera: Camera;
  destroy(): void;
}
