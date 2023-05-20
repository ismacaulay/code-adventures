import { CameraType } from 'toolkit/camera/camera';
import { createCameraController, type CameraController } from 'toolkit/camera/cameraController';
import { CameraControlType } from 'toolkit/camera/controls';
import type { BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import { createCameraFrustumRenderer } from './cameraFrustumRenderer';
import type { Renderer } from './renderer';

// TODO
// - sync debug camera to current camera on first launch
// - home key should restore the debug camera somewhere (and the normal camera)
// - dont copy the buffers all the time
// - add colours to frustum renderer
// - dynamic camera since now the near and far planes will be messy
// - clean up debugMode?

export function createDebugRenderSystem(params: {
  canvas: HTMLElement;
  cameraController: CameraController;
  renderer: Renderer;
  bufferManager: BufferManager;
  shaderManager: ShaderManager;
}) {
  let enabled = false;

  const cameraController = createCameraController(params.canvas, {
    type: CameraType.Perspective,
    control: CameraControlType.Free,
  });
  cameraController.camera.znear = 0.01;
  cameraController.camera.zfar = 1000;
  cameraController.camera.updateProjectionMatrix();

  const frustumRenderer = createCameraFrustumRenderer(params);

  return {
    get enabled() {
      return enabled;
    },
    set enabled(value: boolean) {
      enabled = value;

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
