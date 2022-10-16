import type { Camera } from 'toolkit/camera/camera';
import { createOrthographicCamera } from 'toolkit/camera/orthographic';
import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';

import type { EntityManager } from 'types/ecs/entity';
import type { ReadonlySceneGraph } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly camera: Camera;
  readonly sceneGraph: ReadonlySceneGraph;
  readonly entityManager: EntityManager;

  loadScene(url: string): Promise<void>;

  destroy(): void;
}

export function createWebGPUApplication(canvas: HTMLCanvasElement): WebGPUApplication {
  console.log('creating webgpu application');

  const sceneGraph = createSceneGraph();

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const aspect = width / height;

  const camera = createOrthographicCamera({
    aspect,

    left: -2.5,
    right: 2.5,
    top: 2.5,
    bottom: 2.5,

    znear: 0.1,
    zfar: 1000,
  });

  const entityManager = createEntityManager();

  const sceneLoader = createSceneLoader({ entityManager, sceneGraph, camera });

  // let frameId = -1;
  // function render() {
  //   frameId = requestAnimationFrame(render);
  // }
  // render();

  return {
    async loadScene(url: string) {
      await sceneLoader.load(url);
    },

    destroy() {},

    camera,
    sceneGraph,
    entityManager,
  };
}
