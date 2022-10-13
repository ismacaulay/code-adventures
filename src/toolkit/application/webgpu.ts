import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import type { WebGPUApplication } from 'types/application/WebGPUApplication';

export function createWebGPUApplication(_canvas: HTMLCanvasElement): WebGPUApplication {
  console.log('creating webgpu application');

  const sceneGraph = createSceneGraph();

  const entityManager = createEntityManager();

  const sceneLoader = createSceneLoader({ entityManager, sceneGraph });

  return {
    async loadScene(url: string) {
      await sceneLoader.load(url);
    },

    destroy() {},

    sceneGraph,
    entityManager,
  };
}
