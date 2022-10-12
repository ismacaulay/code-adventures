export interface ReadonlySceneGraphNode {
  readonly uid: string;

  readonly children: readonly ReadonlySceneGraphNode[];
  onChange(cb: () => void): () => void;
}

export interface SceneGraphNode extends ReadonlySceneGraphNode {
  children: readonly SceneGraphNode[];

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
