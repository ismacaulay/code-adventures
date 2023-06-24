import { type SceneGraphNode, createSceneGraphNode } from './node';

export type { SceneGraphNode };

export type SceneGraph = {
  readonly root: SceneGraphNode;

  onChange(cb: () => void): Unsubscriber;
  clear(): void;
  destroy(): void;
};

// TODO: This is a leaky mess and children are not being unsubscribed properly
export function createSceneGraph(): SceneGraph {
  const callbacks: VoidFunction[] = [];

  const root = createSceneGraphNode({ uid: 'root' });
  const unsub = root.onChange(() => {
    callbacks.forEach((cb) => {
      cb();
    });
  });

  return {
    root,

    clear() {
      // TODO: Implement me!
    },
    destroy() {
      unsub();
    },

    onChange(cb: () => void) {
      callbacks.push(cb);

      return () => {
        const idx = callbacks.findIndex((value) => {
          return value === cb;
        });

        if (idx !== -1) {
          callbacks.splice(idx, 1);
        }
      };
    },
  };
}
