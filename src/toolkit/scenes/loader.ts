import { createTransformComponent } from 'toolkit/ecs/components/transform';
import { loadObj } from 'toolkit/loaders/objLoader';
import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
import type { EntityManager } from 'types/ecs/entity';
import type { ReadonlySceneGraphNode, SceneGraph, SceneGraphNode } from 'types/sceneGraph';
import type { EntityV1 } from 'types/scenes/v1/entity';
import { GeometryComponentTypeV1 } from 'types/scenes/v1/geometry';
import type { SceneV1 } from 'types/scenes/v1/scene';
import type { SceneGraphDescriptorV1 } from 'types/scenes/v1/sceneGraph';

function isSceneV1(scene: any): scene is SceneV1 {
  return scene?.version === 1;
}

export function createSceneLoader({
  entityManager,
  sceneGraph,
}: {
  entityManager: EntityManager;
  sceneGraph: SceneGraph;
}) {
  return {
    async load(url: string) {
      const scene = await fetch(url).then((r) => r.json());
      console.log(scene);

      if (!isSceneV1(scene)) {
        throw new Error('Unkown scene version');
      }

      // const { target, position, up } = camera;
      // camera.update({ target, position, up });

      Object.entries(scene.entities).forEach(([uid, state]) => {
        entityManager.add(uid);

        const { transform, geometry } = state;

        entityManager.addComponent(uid, createTransformComponent({ ...transform }));

        if (geometry.type === GeometryComponentTypeV1.Obj) {
          loadObj(geometry.location).then(({ vertices, faces }) => {
            console.log(vertices);
            console.log(faces);
          });
        }
      });

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
    },
  };
}
