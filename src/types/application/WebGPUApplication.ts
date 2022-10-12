import type { ReadonlySceneGraph } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly sceneGraph: ReadonlySceneGraph;

  loadScene(url: string): Promise<void>;

  destroy(): void;
}
