import type { SceneGraphNode } from 'types/sceneGraph';

export function createSceneGraphNode({ uid }: { uid: string }): SceneGraphNode {
  const children: SceneGraphNode[] = [];

  const unsubscribers = [];
  const callbacks: VoidFunction[] = [];

  function changed() {
    callbacks.forEach((cb) => cb());
  }

  return {
    uid,
    children,

    add(child) {
      children.push(child);

      unsubscribers.push(
        child.onChange(() => {
          changed();
        }),
      );

      changed();
    },

    remove(child) {
      const idx = children.findIndex((value) => {
        return child.uid === value.uid;
      });

      if (idx === -1) {
        throw new Error(`[SceneGraphNode::remove] Unable to find child : ${child.uid}`);
      }

      children.splice(idx, 1);

      changed();
    },

    onChange(cb) {
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
