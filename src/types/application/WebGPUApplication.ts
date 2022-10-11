import type { ReadOnlySceneGraph } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly sceneGraph: ReadOnlySceneGraph;

  loadScene(url: string): Promise<void>;

  destroy(): void;
}
