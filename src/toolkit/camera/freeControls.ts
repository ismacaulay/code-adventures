import { vec3 } from 'gl-matrix';
import { radians } from 'toolkit/math';
import { createSignal } from 'toolkit/signal';
import type { Camera } from './camera';
import { CameraControlType, type FreeCameraControls } from './controls';

const W_KEY_BIT = 1 << 1;
const A_KEY_BIT = 1 << 2;
const S_KEY_BIT = 1 << 3;
const D_KEY_BIT = 1 << 4;
const C_KEY_BIT = 1 << 5;
const SPACE_KEY_BIT = 1 << 6;

function directionValue(keys: number, negBit: number, posBit: number) {
  return (!!(keys & posBit) ? 1 : 0) + (!!(keys & negBit) ? -1 : 0);
}

export function createFreeControls(
  canvas: HTMLElement,
  initial: {
    camera: Camera;
  },
  options: {
    mouseSensitivity: number;
    moveSensitivity: number;
  } = {
    mouseSensitivity: 0.1,
    moveSensitivity: 2.5,
  },
): FreeCameraControls {
  let { mouseSensitivity, moveSensitivity } = options;

  let enabled = false;
  let changed = false;
  let signal = createSignal();

  let camera: Camera = initial.camera;

  let keys = 0x00;
  let locked = false;
  function onClick() {
    if (locked) return;

    (canvas.requestPointerLock() as any).catch(() => {
      console.warn('Failed to requestPointerLock');
    });
    keys = 0x00;
  }

  function onPointerLockChanged() {
    if (document.pointerLockElement === canvas) {
      locked = true;
    } else {
      locked = false;
    }
    changed = true;
  }

  function onPointerLockError() {
    console.warn('Pointer lock error!');
    locked = false;
  }

  function onKeyDown(evt: KeyboardEvent) {
    switch (evt.code) {
      // W
      case 'KeyW':
        keys |= W_KEY_BIT;
        break;
      // A
      case 'KeyA':
        keys |= A_KEY_BIT;
        break;
      // S
      case 'KeyS':
        keys |= S_KEY_BIT;
        break;
      // D
      case 'KeyD':
        keys |= D_KEY_BIT;
        break;
      // C
      case 'KeyC':
        keys |= C_KEY_BIT;
        break;
      // space
      case 'Space':
        keys |= SPACE_KEY_BIT;
        break;
    }
    changed = true;
  }

  function onKeyUp(evt: KeyboardEvent) {
    switch (evt.code) {
      // W
      case 'KeyW':
        keys &= ~W_KEY_BIT;
        break;
      // A
      case 'KeyA':
        keys &= ~A_KEY_BIT;
        break;
      // S
      case 'KeyS':
        keys &= ~S_KEY_BIT;
        break;
      // D
      case 'KeyD':
        keys &= ~D_KEY_BIT;
        break;
      // C
      case 'KeyC':
        keys &= ~C_KEY_BIT;
        break;
      // space
      case 'Space':
        keys &= ~SPACE_KEY_BIT;
        break;
    }
    changed = true;
  }

  let yaw = -90;
  let pitch = 0;
  const front = vec3.create();
  const right = vec3.create();
  const worldUp = vec3.fromValues(0, 1, 0);

  function updateCamera() {
    vec3.normalize(
      front,
      vec3.set(
        front,
        Math.cos(radians(yaw)) * Math.cos(radians(pitch)),
        Math.sin(radians(pitch)),
        Math.sin(radians(yaw)) * Math.cos(radians(pitch)),
      ),
    );

    vec3.normalize(right, vec3.cross(right, front, worldUp));

    vec3.cross(camera.up, right, front);
    vec3.add(camera.target, camera.position, front);
    camera.updateViewMatrix();
  }

  function onMouseMove(evt: MouseEvent) {
    if (!locked) return;

    yaw += evt.movementX * mouseSensitivity;
    pitch += -evt.movementY * mouseSensitivity;

    if (pitch > 89.0) pitch = 89.0;
    if (pitch < -89.0) pitch = -89.0;

    updateCamera();
    changed = true;
  }

  function addEventListeners() {
    canvas.addEventListener('click', onClick, false);
    document.addEventListener('pointerlockchange', onPointerLockChanged, false);
    document.addEventListener('pointerlockerror', onPointerLockError, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
  }

  function removeEventListeners() {
    canvas.removeEventListener('click', onClick, false);
    document.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener('keyup', onKeyUp, false);
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('pointerlockchange', onPointerLockChanged, false);
    document.removeEventListener('pointerlockerror', onPointerLockError, false);
    locked = false;
  }

  const _front = vec3.create();
  const _right = vec3.create();
  const _up = vec3.create();
  const dir = vec3.create();

  return {
    type: CameraControlType.Free,

    get enabled() {
      return enabled;
    },
    set enabled(value: boolean) {
      enabled = value;

      if (enabled) {
        addEventListeners();
      } else {
        removeEventListeners();
      }
    },

    set camera(value: Camera) {
      camera = value;
    },

    set moveSensitivity(value: number) {
      moveSensitivity = value;
    },

    set mouseSensitivity(value: number) {
      mouseSensitivity = value;
    },

    // TODO: dt is always 0
    update(dt: number) {
      if (!enabled) return;
      if (!locked) return;
      if (!changed) return;

      vec3.scale(_front, front, dt * directionValue(keys, S_KEY_BIT, W_KEY_BIT) * moveSensitivity);

      vec3.scale(_right, right, dt * directionValue(keys, A_KEY_BIT, D_KEY_BIT) * moveSensitivity);

      vec3.scale(
        _up,
        camera.up,
        dt * directionValue(keys, C_KEY_BIT, SPACE_KEY_BIT) * moveSensitivity,
      );

      vec3.add(dir, _up, vec3.add(dir, _front, _right));
      vec3.add(camera.position, camera.position, dir);
      updateCamera();

      changed = (keys | 0x00) != 0;
      signal.emit();
    },

    subscribe(cb: VoidFunction) {
      return signal.subscribe(cb);
    },

    destroy() {
      removeEventListeners();
      signal.destroy();
    },
  };
}
