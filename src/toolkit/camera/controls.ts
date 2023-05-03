import type { Camera } from './camera';

export enum CameraControlType {
  Free = 'free',
  Orbit = 'orbit',
}

export type FreeCameraControls = {
  type: CameraControlType.Free;

  moveSensitivity: number;
  mouseSensitivity: number;

  update(dt: number): void;
  camera: Camera;
  destroy(): void;
};

export type OrbitCameraControls = {
  type: CameraControlType.Orbit;

  update(dt: number): void;
  camera: Camera;
  destroy(): void;
};

export type CameraControls = FreeCameraControls | OrbitCameraControls;
