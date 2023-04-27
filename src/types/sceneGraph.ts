export interface ReadonlySceneGraphNode {
  readonly uid: string;
  readonly renderOrder: number;
  readonly visible: boolean;

  readonly children: readonly ReadonlySceneGraphNode[];
  onChange(cb: () => void): () => void;
}

export interface SceneGraphNode extends ReadonlySceneGraphNode {
  children: readonly SceneGraphNode[];
  renderOrder: number;
  visible: boolean;

  add(child: SceneGraphNode): void;
  remove(child: SceneGraphNode): void;
}

export interface ReadonlySceneGraph {
  readonly root: ReadonlySceneGraphNode;

  onChange(cb: () => void): () => void;
}

export interface SceneGraph extends ReadonlySceneGraph {
  readonly root: SceneGraphNode;

  clear(): void;
  destroy(): void;
}
