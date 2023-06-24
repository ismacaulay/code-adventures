export type SceneGraphNode = {
  uid: string;
  children: readonly SceneGraphNode[];

  renderOrder: number;
  visible: boolean;

  onChange(cb: () => void): () => void;
  add(child: SceneGraphNode): void;
  remove(child: SceneGraphNode): void;
};

export function createSceneGraphNode(params: {
  uid: string;
  visible?: boolean;
  renderOrder?: number;
}): SceneGraphNode {
  const { uid, renderOrder = 0 } = params;

  let visible = params.visible ?? true;

  const children: SceneGraphNode[] = [];

  const unsubscribers: Unsubscriber[] = [];
  const callbacks: VoidFunction[] = [];

  function changed() {
    callbacks.forEach((cb) => cb());
  }

  return {
    uid,
    children,
    renderOrder,

    get visible() {
      return visible;
    },
    set visible(value: boolean) {
      visible = value;
      changed();
    },

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
      const unsubs = unsubscribers.splice(idx, 1);
      unsubs.forEach((cb) => cb());

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
