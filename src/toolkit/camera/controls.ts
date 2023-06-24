import type { Camera } from './camera';

export enum CameraControlType {
  Free = 'free',
  Orbit = 'orbit',
}

export type FreeCameraControls = {
  type: CameraControlType.Free;
  enabled: boolean;

  moveSensitivity: number;
  mouseSensitivity: number;

  computeYawAndPitch(): void;
  update(dt: number): void;
  camera: Camera;
  destroy(): void;

  subscribe(cb: VoidFunction): Unsubscriber;
};

export type OrbitCameraControls = {
  type: CameraControlType.Orbit;
  enabled: boolean;

  update(dt: number): void;
  camera: Camera;
  destroy(): void;

  subscribe(cb: VoidFunction): Unsubscriber;
};

export type CameraControls = FreeCameraControls | OrbitCameraControls;
