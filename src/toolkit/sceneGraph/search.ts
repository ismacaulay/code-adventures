import type { SceneGraphNode } from './node';

export function findNodeByUid(node: SceneGraphNode, uid: string): SceneGraphNode | undefined {
  if (node.uid === uid) {
    return node;
  }

  for (let i = 0; i < node.children.length; ++i) {
    const result = findNodeByUid(node.children[i], uid);
    if (result) {
      return result;
    }
  }

  return undefined;
}
