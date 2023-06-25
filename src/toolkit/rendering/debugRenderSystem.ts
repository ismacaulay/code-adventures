import { CameraType } from 'toolkit/camera/camera';
import { createCameraController, type CameraController } from 'toolkit/camera/cameraController';
import { CameraControlType } from 'toolkit/camera/controls';
import type { BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import type { SceneBoundingBox } from 'toolkit/sceneBoundingBox';
import { createCameraFrustumRenderer } from './cameraFrustumRenderer';
import type { Renderer } from './renderer';

// TODO
// - dynamic camera since now the near and far planes will be messy
// - home key should restore the debug camera somewhere (and the normal camera)
// - clean up debugMode?

export function createDebugRenderSystem(params: {
  canvas: HTMLElement;
  cameraController: CameraController;
  renderer: Renderer;
  bufferManager: BufferManager;
  shaderManager: ShaderManager;
  sceneBoundingBox: SceneBoundingBox;
}) {
  const { cameraController: normalCameraController } = params;

  let enabled = false;
  const cameraController = createCameraController(
    params.canvas,
    params.sceneBoundingBox,
    { autoNearFar: false },
    {
      type: CameraType.Perspective,
      control: CameraControlType.Free,
    },
  );
  // TODO: make these dynamic?
  cameraController.camera.znear = 0.1;
  cameraController.camera.zfar = 500000;
  cameraController.camera.updateProjectionMatrix();
  if (cameraController.controls.type === CameraControlType.Free) {
    cameraController.controls.moveSensitivity = 5000;
  }
  const frustumRenderer = createCameraFrustumRenderer(params);

  let firstTime = true;

  return {
    get enabled() {
      return enabled;
    },
    set enabled(value: boolean) {
      enabled = value;

      if (enabled && firstTime) {
        cameraController.position = normalCameraController.position;
        cameraController.up = normalCameraController.up;
        cameraController.target = normalCameraController.target;
        if (cameraController.controls.type === CameraControlType.Free) {
          cameraController.controls.computeYawPitch();
        }

        firstTime = false;
      }

      cameraController.controls.enabled = value;
    },

    update(dt: number) {
      cameraController.update(dt);
      frustumRenderer.update();
    },

    render() {
      frustumRenderer.render();
    },

    resize(width: number, height: number) {
      cameraController.aspect = width / height;
    },

    destroy() {
      cameraController.destroy();
      frustumRenderer.destroy();
    },

    cameraController,
  };
}

export type DebugRenderSystem = ReturnType<typeof createDebugRenderSystem>;
