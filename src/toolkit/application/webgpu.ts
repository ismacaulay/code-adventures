import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import type { WebGPUApplication } from 'types/application/WebGPUApplication';

export function createWebGPUApplication(canvas: HTMLCanvasElement): WebGPUApplication {
  console.log('creating webgpu application');

  const sceneGraph = createSceneGraph();
  const sceneLoader = createSceneLoader({ sceneGraph });

  return {
    async loadScene(url: string) {
      await sceneLoader.load(url);
    },

    destroy() {},

    sceneGraph,
  };
}
