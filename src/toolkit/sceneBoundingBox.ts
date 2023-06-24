import { BoundingBox } from './geometry/boundingBox';
import { createCallbackHandler } from './subscription';
import type { SceneGraph, SceneGraphNode } from './sceneGraph';
import { vec3 } from 'gl-matrix';
import { createQueue } from './dataStructures/queue';
import type { EntityManager } from 'types/ecs/entity';
import { ComponentType } from 'types/ecs/component';

export function createSceneBoundingBox(
  sceneGraph: SceneGraph,
  ctx: { entityManager: EntityManager },
) {
  const callbacks = createCallbackHandler<BoundingBox>();
  const boundingBox = BoundingBox.create();

  const sceneGraphUnsub = sceneGraph.onChange(() => {
    computeSceneBoundingBox(boundingBox, sceneGraph.root, ctx);
    console.log(BoundingBox.toString(boundingBox));

    callbacks.call(boundingBox);
  });

  return {
    boundingBox,

    subscribe: callbacks.add,

    destroy() {
      callbacks.destroy();
      sceneGraphUnsub();
    },
  };
}

export type SceneBoundingBox = ReturnType<typeof createSceneBoundingBox>;

function computeSceneBoundingBox(
  out: BoundingBox,
  root: SceneGraphNode,
  ctx: { entityManager: EntityManager },
) {
  const q = createQueue<SceneGraphNode>();
  root.children.forEach(q.enqueue);

  if (q.length === 0) {
    return;
  }

  vec3.set(out.min, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  vec3.set(out.max, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

  const { entityManager } = ctx;
  let node: SceneGraphNode;
  let transformedBB = BoundingBox.create();
  while (q.length !== 0) {
    node = q.dequeue()!;
    node.children.forEach(q.enqueue);

    const transform = entityManager.getComponent(node.uid, ComponentType.Transform);
    if (!transform) {
      continue;
    }

    const geom = entityManager.getComponent(node.uid, ComponentType.Geometry);
    if (!geom) {
      continue;
    }

    vec3.transformMat4(transformedBB.min, geom.boundingBox.min, transform.matrix);
    vec3.transformMat4(transformedBB.max, geom.boundingBox.max, transform.matrix);

    if (out.min[0] > transformedBB.min[0]) {
      out.min[0] = transformedBB.min[0];
    }
    if (out.min[1] > transformedBB.min[1]) {
      out.min[1] = transformedBB.min[1];
    }
    if (out.min[2] > transformedBB.min[2]) {
      out.min[2] = transformedBB.min[2];
    }

    if (out.max[0] < transformedBB.max[0]) {
      out.max[0] = transformedBB.max[0];
    }
    if (out.max[1] < transformedBB.max[1]) {
      out.max[1] = transformedBB.max[1];
    }
    if (out.max[2] < transformedBB.max[2]) {
      out.max[2] = transformedBB.max[2];
    }
  }
}
