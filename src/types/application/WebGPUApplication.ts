import type { EntityManager } from 'types/ecs/entity';
import type { ReadonlySceneGraph } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly sceneGraph: ReadonlySceneGraph;
  readonly entityManager: EntityManager;

  loadScene(url: string): Promise<void>;

  destroy(): void;
}
