import { vec3 } from 'gl-matrix';
import type { Camera } from 'toolkit/camera/camera';
import { createMeshGeometryComponent } from 'toolkit/ecs/components/geometry';
import { createBasicMaterialComponent } from 'toolkit/ecs/components/material';
import { createTransformComponent } from 'toolkit/ecs/components/transform';
import { loadObj } from 'toolkit/loaders/objLoader';
import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
import { BufferAttributeFormat } from 'types/ecs/component';
import type { EntityManager } from 'types/ecs/entity';
import type { SceneGraph, SceneGraphNode } from 'types/sceneGraph';
import { GeometryComponentTypeV1 } from 'types/scenes/v1/geometry';
import { MaterialComponentTypeV1 } from 'types/scenes/v1/material';
import type { SceneV1 } from 'types/scenes/v1/scene';
import type { SceneGraphDescriptorV1 } from 'types/scenes/v1/sceneGraph';

function isSceneV1(scene: any): scene is SceneV1 {
  return scene?.version === 1;
}

export function createSceneLoader({
  entityManager,
  sceneGraph,
  camera,
}: {
  entityManager: EntityManager;
  sceneGraph: SceneGraph;
  camera: Camera;
}) {
  return {
    async load(url: string) {
      const scene = await fetch(url).then((r) => r.json());
      console.log(scene);

      if (!isSceneV1(scene)) {
        throw new Error('Unkown scene version');
      }

      const { target, position, up } = scene.camera;
      vec3.copy(camera.target, target);
      vec3.copy(camera.position, position);
      vec3.copy(camera.up, up);
      camera.updateViewMatrix();
      camera.updateProjectionMatrix();

      await Promise.all(
        Object.entries(scene.entities).map(async ([uid, state]) => {
          entityManager.add(uid);

          const { transform, geometry, material } = state;

          entityManager.addComponent(uid, createTransformComponent({ ...transform }));

          if (geometry.type === GeometryComponentTypeV1.Obj) {
            const { vertices, faces } = await loadObj(geometry.location);

            entityManager.addComponent(
              uid,
              createMeshGeometryComponent({
                count: faces.length,
                indices: faces,
                buffers: [
                  {
                    array: vertices,
                    attributes: [
                      {
                        format: BufferAttributeFormat.Float32x3,
                        location: 0,
                      },
                    ],
                  },
                ],
              }),
            );
          } else if (geometry.type === GeometryComponentTypeV1.Mesh) {
            const { vertices, triangles } = geometry;

            const vertBuf = new Float64Array(vertices);
            const triBuf = new Uint32Array(triangles);
            entityManager.addComponent(
              uid,
              createMeshGeometryComponent({
                count: triBuf.length,
                indices: triBuf,
                buffers: [
                  {
                    array: vertBuf,
                    attributes: [
                      {
                        format: BufferAttributeFormat.Float32x3,
                        location: 0,
                      },
                    ],
                  },
                ],
              }),
            );
          }

          if (material.type === MaterialComponentTypeV1.MeshBasicMaterial) {
            entityManager.addComponent(
              uid,
              createBasicMaterialComponent({ colour: material.colour }),
            );
          }
        }),
      );

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
