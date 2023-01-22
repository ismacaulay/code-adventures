import type { CameraController } from 'toolkit/camera/cameraController';
import type { ComponentManager } from 'toolkit/ecs/componentManager';
import { isGeometryComponent, isMaterialComponent } from 'toolkit/ecs/components';
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

async function loadJSON(url: string) {
  return fetch(url).then((r) => {
    if (!r.ok) {
      throw new Error(`Failed to load json: ${url}, ${r.status}, ${r.statusText}`);
    }

    return r.json();
  });
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
  async function processComponent(state: ComponentV1 | string): Promise<Maybe<Component>> {
    if (typeof state === 'string') {
      return processComponent(await loadJSON(state));
    }

    let fullState = { ...state };
    let component: Maybe<Component>;
    if (state.base) {
      const baseState = await loadJSON(state.base);
      fullState = { ...baseState, ...fullState };
    }

    if (isGeometryComponentV1(fullState)) {
      component = await createGeometryComponent(fullState);
    } else if (isMaterialComponentV1(fullState)) {
      component = await createMaterialComponent(fullState, { textureManager });
    }

    return component;
  }

  return {
    async load(url: string) {
      const scene = await fetch(url).then((r) => r.json());
      console.log(`loaded scene: ${url}`);
      console.log(scene);

      if (!isSceneV1(scene)) {
        throw new Error('Unkown scene version');
      }

      const { type, target, position, up, controls } = scene.camera;
      cameraController.cameraType = type;
      if (controls) {
        cameraController.controlType = controls;
      }
      cameraController.target = target;
      cameraController.position = position;
      cameraController.up = up;

      if (scene.components) {
        await Promise.all(
          Object.entries(scene.components).map(async ([uid, state]) => {
            const component = await processComponent(state);

            if (component) {
              componentManager.add(uid, component);
            } else {
              throw new Error(
                `[createSceneLoader] Unknown component in component list: [${uid}]: ${state}`,
              );
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
              throw new Error(`[SceneLoader::load] Invalid geometry component: ${geometry}`);
            }
          } else {
            geometryComponent = await createGeometryComponent(geometry);
          }
          entityManager.addComponent(uid, geometryComponent);

          let materialComponent: Component;
          if (typeof material === 'string') {
            let sharedComponent = componentManager.get(material);
            if (!isMaterialComponent(sharedComponent)) {
              throw new Error(`[SceneLoader::load] Invalid material component: ${material}`);
            }

            materialComponent = structuredClone(sharedComponent);
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
