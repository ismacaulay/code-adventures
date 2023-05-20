import type { CameraController } from 'toolkit/camera/cameraController';
import type { BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import { createCameraFrustumRenderer } from './cameraFrustumRenderer';
import type { Renderer } from './renderer';

// TODO
// - move debugCameraController into here
// - sync debug camera to current camera on first launch
// - home key should restore the debug camera somewhere (and the normal camera)
// - dont copy the buffers all the time
// - add colours to frustum renderer
// - clean up debugMode?

export function createDebugRenderSystem(params: {
  cameraController: CameraController;
  renderer: Renderer;
  bufferManager: BufferManager;
  shaderManager: ShaderManager;
}) {
  const frustumRenderer = createCameraFrustumRenderer(params);

  return {
    update() {
      frustumRenderer.update();
    },

    render() {
      frustumRenderer.render();
    },
  };
}
