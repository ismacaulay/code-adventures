import { vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import { Frustum } from 'toolkit/math/frustum';
import type { SceneBoundingBox } from 'toolkit/sceneBoundingBox';
import { createSignal } from 'toolkit/signal';
import { noop } from 'toolkit/subscription';
import { CameraType, type Camera } from './camera';
import { CameraControlType, type CameraControls } from './controls';
import { createFreeControls } from './freeControls';
import { createOrbitControls } from './orbitControls';
import { createOrthographicCamera } from './orthographic';
import { createPerspectiveCamera } from './perspective';

export interface CameraState {
  type: CameraType;
  target: vec3;
  position: vec3;
  up: vec3;
}

export type CameraController = {
  camera: Camera;
  controls: CameraControls;

  cameraType: CameraType;
  controlType: CameraControlType;
  aspect: number;
  target: vec3;
  position: vec3;
  up: vec3;
  near: number;
  far: number;
  frustum: Frustum;

  update(dt: number): void;
  destroy(): void;

  /**
   * subscribe to changes to the camera matrices
   */
  subscribe(cb: VoidFunction): Unsubscriber;
};

export function createCameraController(
  canvas: HTMLElement,
  sceneBoundingBox: SceneBoundingBox,
  opts?: {
    autoNearFar?: boolean;
  },
  initial: {
    type: CameraType;
    control: CameraControlType;
  } = { type: CameraType.Perspective, control: CameraControlType.Orbit },
): CameraController {
  const unsubscribers: Unsubscriber[] = [];
  const signal = createSignal();

  const { autoNearFar = true } = opts || {};

  const orthographic = createOrthographicCamera({
    aspect: canvas.clientWidth / canvas.clientHeight,

    left: -2.5,
    right: 2.5,
    top: 2.5,
    bottom: -2.5,

    znear: 0,
    zfar: 10,
  });

  const perspective = createPerspectiveCamera({
    aspect: canvas.clientWidth / canvas.clientHeight,
    fov: 45,
    znear: 0.1,
    zfar: 10,
  });

  let currentType: CameraType = initial.type;
  let camera: Camera = currentType === CameraType.Orthographic ? orthographic : perspective;

  // const centre = vec3.create();
  const tmp = vec3.create();
  function recomputeNearAndFarPlanes() {
    if (!autoNearFar) {
      return;
    }

    const corners = BoundingBox.corners(sceneBoundingBox.boundingBox);
    let dist: number;
    let near = Number.POSITIVE_INFINITY;
    let far = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < corners.length; ++i) {
      vec3.transformMat4(tmp, corners[i], camera.view);
      dist = -tmp[2];
      if (dist < near) {
        near = dist;
      }

      if (dist > far) {
        far = dist;
      }
    }

    if (near > far) {
      const tmp = near;
      near = far;
      far = tmp;
    }

    const buffer = 0.01 * Math.abs(far - near);
    far = far + buffer;
    near = near - buffer;

    if (near < 0) {
      const diag = BoundingBox.diagonal(sceneBoundingBox.boundingBox);
      near = diag * 0.001;
    }

    // BoundingBox.centre(sceneBoundingBox.boundingBox, centre);
    // const diag = BoundingBox.diagonal(sceneBoundingBox.boundingBox);
    // const d = vec3.length(vec3.sub(tmp, camera.position, centre));
    // const offset = diag / 2;
    // // const dMin = vec3.length(vec3.sub(tmp, sceneBoundingBox.boundingBox.min, centre));
    // // const dMax = vec3.length(vec3.sub(tmp, sceneBoundingBox.boundingBox.max, centre));
    //
    // let far = d + offset;
    // let near = d - offset;
    // if (near < 0) {
    //   near = diag * 0.001;
    // }

    camera.znear = near;
    camera.zfar = far;
    camera.updateProjectionMatrix();
  }

  function updateFreeControlMoveSensitivity() {
    if (controls.type === CameraControlType.Free) {
      const { min, max } = sceneBoundingBox.boundingBox;
      const longest = Math.max(Math.max(max[0] - min[0], max[1] - min[1]), max[2] - min[2]);
      controls.moveSensitivity = 0.25 * longest;
    }
  }

  const frustum = Frustum.create();
  unsubscribers.push(
    signal.subscribe(() => {
      recomputeNearAndFarPlanes();
      Frustum.setFromMatrix(frustum, camera.viewProjection);
    }),
    sceneBoundingBox.subscribe(() => {
      updateFreeControlMoveSensitivity();
      recomputeNearAndFarPlanes();
    }),
  );

  let currentControlType: CameraControlType;
  let controls: CameraControls;
  let controlsUnsub: Unsubscriber = noop;
  function setControlType(type: CameraControlType) {
    if (type === currentControlType) {
      return;
    }

    const enabled = controls?.enabled ?? true;
    if (controls) {
      controls.destroy();
      controlsUnsub();
      controlsUnsub = noop;
    }

    if (type === CameraControlType.Free) {
      controls = createFreeControls(canvas, { camera });
      controlsUnsub = controls.subscribe(signal.emit);
      updateFreeControlMoveSensitivity();
    } else if (type === CameraControlType.Orbit) {
      controls = createOrbitControls(canvas, { camera });
      controlsUnsub = controls.subscribe(signal.emit);
    } else {
      throw new Error(`[CameraController::setControlType] Unknown control type: ${type}`);
    }

    controls.enabled = enabled;

    currentControlType = type;
    signal.emit();
  }
  setControlType(initial.control);

  signal.emit();

  return {
    get camera() {
      return camera;
    },

    get controls() {
      return controls;
    },

    get cameraType() {
      return currentType;
    },
    set cameraType(type) {
      if (type === currentType) {
        return;
      }

      const target = camera.target;
      const position = camera.position;
      const up = camera.up;
      const aspect = camera.aspect;

      camera = type === CameraType.Orthographic ? orthographic : perspective;

      vec3.copy(camera.target, target);
      vec3.copy(camera.position, position);
      vec3.copy(camera.up, up);
      camera.aspect = aspect;
      recomputeNearAndFarPlanes();

      camera.updateViewMatrix();
      camera.updateProjectionMatrix();

      controls.camera = camera;
      currentType = type;

      signal.emit();
    },

    get controlType() {
      return currentControlType;
    },
    set controlType(value) {
      setControlType(value);
    },

    get aspect() {
      return camera.aspect;
    },
    set aspect(aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      signal.emit();
    },

    get target() {
      return camera.target;
    },
    set target(target) {
      vec3.copy(camera.target, target);
      camera.updateViewMatrix();
      signal.emit();
    },

    get position() {
      return camera.position;
    },
    set position(position) {
      vec3.copy(camera.position, position);
      camera.updateViewMatrix();
      signal.emit();
    },

    get up() {
      return camera.up;
    },
    set up(up) {
      vec3.copy(camera.up, up);
      camera.updateViewMatrix();
      signal.emit();
    },

    get near() {
      return camera.znear;
    },
    get far() {
      return camera.zfar;
    },

    get frustum() {
      return frustum;
    },

    update(dt) {
      controls.update(dt);
    },

    destroy() {
      unsubscribers.forEach((cb) => cb());
      controls.destroy();
      signal.destroy();
    },

    subscribe(cb: VoidFunction) {
      return signal.subscribe(cb);
    },
  };
}
