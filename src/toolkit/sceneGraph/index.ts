import { children } from 'svelte/internal';
import type { SceneGraph } from 'types/sceneGraph';
import { createSceneGraphNode } from './node';

export function createSceneGraph(): SceneGraph {
  const callbacks = [];

  const root = createSceneGraphNode({ uid: 'root' });
  const unsub = root.onChange(() => {
    callbacks.forEach((cb) => {
      cb();
    });
  });

  return {
    root,

    clear() {},
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
