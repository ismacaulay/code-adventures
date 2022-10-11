import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
import type { ReadOnlySceneGraphNode, SceneGraph, SceneGraphNode } from 'types/sceneGraph';
import type { EntityV1 } from 'types/scenes/v1/entity';
import type { SceneV1 } from 'types/scenes/v1/scene';
import type { SceneGraphDescriptorV1 } from 'types/scenes/v1/sceneGraph';

function isSceneV1(scene: any): scene is SceneV1 {
  return scene?.version === 1;
}

export function createSceneLoader({ sceneGraph }: { sceneGraph: SceneGraph }) {
  return {
    async load(url: string) {
      const scene = await fetch(url).then((r) => r.json());
      console.log(scene);

      if (!isSceneV1(scene)) {
        throw new Error('Unkown scene version');
      }

      // const { target, position, up } = camera;
      // camera.update({ target, position, up });

      function addToSceneGraph(node: SceneGraphNode, { entity, children }: SceneGraphDescriptorV1) {
        const childNode = createSceneGraphNode({ uid: entity });
        node.add(childNode);

        children?.forEach((child) => {
          addToSceneGraph(childNode, child);
        });
      }

      scene.root.forEach((entry) => {
        addToSceneGraph(sceneGraph.root, entry);
      });

      Object.entries(scene.entities).forEach(([uid, state]) => {
        // const entity = entityManager.createEntity(uid);
        // const { transform, geometry, material } = state;
        // const { position, rotation, scale } = transform;
        // const createTransformComponent;
        // entityManager.addComponent(createTransformComponent(position, rotation, scale));
      });
    },
  };
}
