import { CameraType } from 'toolkit/camera/camera';
import type { CameraController } from 'toolkit/camera/cameraController';
import type { ComponentManager } from 'toolkit/ecs/componentManager';
import {
  isGeometryComponent,
  isMaterialComponent,
  isScriptComponent,
} from 'toolkit/ecs/components';
import { createTransformComponent } from 'toolkit/ecs/components/transform';
import type { ScriptManager } from 'toolkit/ecs/scriptManager';
import type { TextureManager } from 'toolkit/ecs/textureManager';
import { RendererType, type Renderer } from 'toolkit/rendering/renderer';
import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
import type { Component } from 'types/ecs/component';
import type { EntityManager } from 'types/ecs/entity';
import type { SceneGraph, SceneGraphNode } from 'toolkit/sceneGraph';
import type { SceneV1 } from 'types/scenes/v1/scene';
import type { SceneGraphDescriptorV1 } from 'types/scenes/v1/sceneGraph';
import {
  isGeometryComponentV1,
  isMaterialComponentV1,
  isScriptComponentV1,
  type ComponentV1,
} from '../component';
import { createGeometryComponent } from './geometry';
import { createMaterialComponent } from './material';
import { createScriptComponent } from './script';

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
  componentManager,
  textureManager,
  scriptManager,
  sceneGraph,
  cameraController,
  renderer,
}: {
  entityManager: EntityManager;
  componentManager: ComponentManager;
  textureManager: TextureManager;
  scriptManager: ScriptManager;
  sceneGraph: SceneGraph;
  cameraController: CameraController;
  renderer: Renderer;
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
    } else if (isScriptComponentV1(fullState)) {
      component = createScriptComponent(fullState);
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

      const settings = scene.settings ?? {};
      renderer.clearColour = settings.background ?? [1.0, 1.0, 1.0];
      renderer.type = settings.renderer ?? RendererType.Default;

      const { type, target, position, up, zoom = 1, controls } = scene.camera;
      cameraController.cameraType = type;
      if (controls) {
        cameraController.controlType = controls;
      }
      cameraController.target = target;
      cameraController.position = position;
      cameraController.up = up;
      if (cameraController.camera.type === CameraType.Orthographic) {
        cameraController.camera.zoom = zoom;
        cameraController.camera.updateProjectionMatrix();
      }

      if (scene.components) {
        await Promise.all(
          Object.entries(scene.components).map(async ([uid, state]) => {
            const component = await processComponent(state);

            if (component) {
              componentManager.add(uid, component);
            } else {
              throw new Error(
                `[createSceneLoader] Unknown component in component list: [${uid}]: ${JSON.stringify(
                  state,
                )}`,
              );
            }
          }),
        );
      }

      await Promise.all(
        Object.entries(scene.entities).map(async ([uid, state]) => {
          // TODO: validate entities
          entityManager.add(uid);

          const { transform, geometry, material, script } = state;

          if (transform) {
            entityManager.addComponent(uid, createTransformComponent({ ...transform }));
          } else {
            entityManager.addComponent(uid, createTransformComponent({}));
          }

          if (geometry) {
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
          }

          if (material) {
            let materialComponent: Component;
            if (typeof material === 'string') {
              // TODO: this is not sharing a shader properly since it does
              // not exist when its copied. This causes a new shader to be created
              // everytime instead of being cloned. We can create the shader here
              // since these are used materials for entities
              let sharedComponent = componentManager.get(material);
              if (!isMaterialComponent(sharedComponent)) {
                throw new Error(`[SceneLoader::load] Invalid material component: ${material}`);
              }

              materialComponent = structuredClone(sharedComponent);
            } else {
              materialComponent = await createMaterialComponent(material, { textureManager });
            }
            entityManager.addComponent(uid, materialComponent);
          }

          if (script) {
            let scriptComponent: Component;
            if (typeof script === 'string') {
              scriptComponent = componentManager.get(script);
              if (!isScriptComponent(scriptComponent)) {
                throw new Error(`[SceneLoader::load] Invalid script component: ${script}`);
              }
            } else {
              scriptComponent = createScriptComponent(script);
            }

            if (!scriptComponent.script) {
              scriptComponent.script = await scriptManager.create(scriptComponent);
            }
            entityManager.addComponent(uid, scriptComponent);
          }
        }),
      );

      function addToSceneGraph(
        node: SceneGraphNode,
        { entity, renderOrder, children }: SceneGraphDescriptorV1,
      ) {
        const childNode = createSceneGraphNode({ uid: entity, renderOrder: renderOrder ?? 0 });
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
