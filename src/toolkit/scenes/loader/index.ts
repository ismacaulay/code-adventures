import type { CameraController } from 'toolkit/camera/cameraController';
import type { ComponentManager } from 'toolkit/ecs/componentManager';
import { isGeometryComponent } from 'toolkit/ecs/components';
import { createTransformComponent } from 'toolkit/ecs/components/transform';
import type { TextureManager } from 'toolkit/ecs/textureManager';
import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
import type { Component } from 'types/ecs/component';
import type { EntityManager } from 'types/ecs/entity';
import type { SceneGraph, SceneGraphNode } from 'types/sceneGraph';
import type { SceneV1 } from 'types/scenes/v1/scene';
import type { SceneGraphDescriptorV1 } from 'types/scenes/v1/sceneGraph';
import { isGeometryComponentV1, isMaterialComponentV1, type ComponentV1 } from '../component';
import { createGeometryComponent } from './geometry';
import { createMaterialComponent } from './material';

function isSceneV1(scene: any): scene is SceneV1 {
  return scene?.version === 1;
}

export function createSceneLoader({
  entityManager,
  textureManager,
  componentManager,
  sceneGraph,
  cameraController,
}: {
  entityManager: EntityManager;
  textureManager: TextureManager;
  componentManager: ComponentManager;
  sceneGraph: SceneGraph;
  cameraController: CameraController;
}) {
  return {
    async load(url: string) {
      const scene = await fetch(url).then((r) => r.json());
      console.log(`loaded scene: ${url}`);
      console.log(scene);

      if (!isSceneV1(scene)) {
        throw new Error('Unkown scene version');
      }

      const { type, target, position, up, controls } = scene.camera;
      cameraController.setCameraType(type);
      if (controls) {
        cameraController.setControlType(controls);
      }
      cameraController.setTarget(target);
      cameraController.setPosition(position);
      cameraController.setUp(up);

      if (scene.components) {
        await Promise.all(
          Object.entries(scene.components).map(async ([uid, state]) => {
            let component: Maybe<Component>;

            if (isGeometryComponentV1(state)) {
              component = await createGeometryComponent(state);
            } else if (isMaterialComponentV1(state)) {
              // pass, material components will be create below since shared components
              // still need to clone shaders
            } else {
              throw new Error(
                `[createSceneLoader] Unknown component type in component list: ${
                  (state as any).type
                }`,
              );
            }

            if (component) {
              componentManager.add(uid, component);
            }
          }),
        );
      }

      await Promise.all(
        Object.entries(scene.entities).map(async ([uid, state]) => {
          // TODO: validate entities
          entityManager.add(uid);

          const { transform, geometry, material } = state;

          entityManager.addComponent(uid, createTransformComponent({ ...transform }));

          let geometryComponent: Component;
          if (typeof geometry === 'string') {
            geometryComponent = componentManager.get(geometry);
            if (!isGeometryComponent(geometryComponent)) {
              throw new Error(`[createSceneLoader] Invalid geometry component: ${geometry}`);
            }
          } else {
            geometryComponent = await createGeometryComponent(geometry);
          }
          entityManager.addComponent(uid, geometryComponent);

          let materialComponent: Component;
          if (typeof material === 'string') {
            let descriptor: Maybe<ComponentV1>;
            if (scene.components) {
              descriptor = scene.components[material];
            }
            if (!isMaterialComponentV1(descriptor)) {
              throw new Error(`[createSceneLoader] Invalid material component: ${material}`);
            }
            // TODO: find a way to clone the material so that the shaders are not duplicated?
            materialComponent = await createMaterialComponent(descriptor, { textureManager });
          } else {
            materialComponent = await createMaterialComponent(material, { textureManager });
          }
          entityManager.addComponent(uid, materialComponent);
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
