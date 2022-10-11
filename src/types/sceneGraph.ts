export interface ReadOnlySceneGraphNode {
  readonly uid: string;

  readonly children: readonly ReadOnlySceneGraphNode[];
  onChange(cb: () => void): () => void;
}

export interface SceneGraphNode extends ReadOnlySceneGraphNode {
  children: readonly SceneGraphNode[];

  add(child: SceneGraphNode): void;
  remove(child: SceneGraphNode): void;
}

export interface ReadOnlySceneGraph {
  readonly root: ReadOnlySceneGraphNode;

  onChange(cb: () => void): () => void;
}

export interface SceneGraph extends ReadOnlySceneGraph {
  readonly root: SceneGraphNode;

  clear(): void;
  destroy(): void;
}
