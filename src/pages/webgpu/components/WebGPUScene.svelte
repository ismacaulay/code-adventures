<script lang="ts">
  import Resizer from 'components/Resizer.svelte';
  import TreeView from 'components/TreeView.svelte';
  import TransformEditor from 'components/TransformEditor.svelte';
  import GeometryComponent from 'components/GeometryComponent.svelte';

  import { onMount } from 'svelte';
  import { nanoid } from 'nanoid';
  import { createWebGPUApplication, type WebGPUApplication } from 'toolkit/application/webgpu';
  import type { TreeViewNode } from 'types/components/tree';
  import { type Component, ComponentType } from 'types/ecs/component';
  import type { ReadonlySceneGraphNode } from 'types/sceneGraph';
  import { CameraType, type Camera } from 'toolkit/camera/camera';
  import MaterialEditor from 'components/MaterialEditor.svelte';
  import { createCameraViewModel, type CameraViewModel } from '../models/camera';
  import CameraEditor from './CameraEditor.svelte';
  import { createMaterialViewModel, type MaterialViewModel } from '../models/material';
  import { createGeometryViewModel, type GeometryViewModel } from '../models/geometry';
  import type { RendererType } from 'toolkit/rendering/renderer';
  import { findNodeByUid } from 'toolkit/sceneGraph/search';

  export let app: Maybe<WebGPUApplication> = undefined;
  export let scene: Maybe<string> = undefined;
  export let opts: Maybe<{ rendererType?: RendererType }> = undefined;

  let webGPUSupported = navigator.gpu !== undefined;

  let destroyed = false;
  let canvas: HTMLCanvasElement;
  let tree: Maybe<TreeViewNode>;
  let selectedComponents: (Camera | Component)[] = [];

  let cameraViewModel: CameraViewModel;
  let geometryViewModel: GeometryViewModel;
  let materialViewModel: MaterialViewModel;

  function handleTreeItemSelected(uid: string) {
    if (!app) {
      return;
    }

    selectedComponents = [];

    if (!uid) {
      return;
    }

    if (uid === 'camera') {
      selectedComponents.push(app.cameraController.camera);
    } else {
      const entityManager = app.entityManager;

      const transform = entityManager.getComponent(uid, ComponentType.Transform);
      if (transform) {
        selectedComponents.push(transform);
      }

      const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
      if (geometry) {
        selectedComponents.push(geometry);
        if (geometryViewModel) {
          geometryViewModel.destroy();
        }
        geometryViewModel = createGeometryViewModel(geometry);
      }

      const material = entityManager.getComponent(uid, ComponentType.Material);
      if (material) {
        selectedComponents.push(material);
        if (materialViewModel) {
          materialViewModel.destroy();
        }

        materialViewModel = createMaterialViewModel(material);
      }
    }
  }

  function processSceneGraphNode(node: ReadonlySceneGraphNode): TreeViewNode {
    return {
      uid: node.uid,
      children: node.children.map(processSceneGraphNode),

      checked: node.visible,
    };
  }

  function handleSceneGraphChanged() {
    if (!app) {
      return;
    }

    /* tree = processSceneGraphNode(app.sceneGraph.root); */
    const root = app.sceneGraph.root;
    tree = {
      uid: root.uid,
      children: [
        {
          uid: 'camera',
          children: [],
        },
        ...root.children.map(processSceneGraphNode),
      ],
    };
  }

  function handleVisibilityToggle(e: CustomEvent) {
    if (!app) {
      return;
    }

    const node = findNodeByUid(app.sceneGraph.root, e.detail.text);
    if (node) {
      node.visible = e.detail.value;
    }
  }

  onMount(() => {
    const unsubscribers: Unsubscriber[] = [];

    if (webGPUSupported && app === undefined) {
      (async () => {
        try {
          app = await createWebGPUApplication(nanoid(), canvas, opts);
          // during a hot reload, the component could get unmounted
          // before the application has finished being created
          if (!destroyed) {
            cameraViewModel = createCameraViewModel(app.cameraController);

            unsubscribers.push(app.sceneGraph.onChange(handleSceneGraphChanged));

            if (scene) {
              await app.loadScene(scene);
            }

            (window as any).debug = { app };
            app.start();
          } else {
            app.destroy();
            app = undefined;
          }
        } catch (e: any) {
          console.log('Failed to create application: ', e);
        }
      })();
    }

    return () => {
      destroyed = true;

      unsubscribers.forEach((unsub) => unsub());
      app?.destroy();
      app = undefined;
      if ((window as any).debug) {
        (window as any).debug = undefined;
      }
    };
  });
</script>

<style>
  .container {
    width: 100vw;
    height: 100vh;
  }

  .horizontal-split-view-container {
    height: 100vh;
    display: flex;
    flex-direction: row;
  }

  .left-split-view-container {
    height: 100vh;
    width: 25%;
    min-width: min-content;
    width: 365px;
  }

  .right-split-view-container {
    flex: 1 1 0%;
  }

  .vertical-split-view-container {
    height: 100%;
    min-width: 250px;
    display: flex;
    flex-direction: column;
  }

  .top-split-view-container {
    height: 50%;
    min-height: 10%;
    max-height: 90%;
    overflow: auto;
    margin: 3px;
  }

  .bottom-split-view-container {
    flex: 1 1 0%;
    min-height: min-content;
    margin: 3px;
  }

  .canvas-container {
    height: 100%;
  }

  .unsupported-container {
    padding-left: 10px;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>

<svelte:head>
  <title>WebGPU</title>
</svelte:head>

<div class="container">
  <div class="horizontal-split-view-container">
    <div class="left-split-view-container">
      <div class="vertical-split-view-container">
        <div class="top-split-view-container">
          <TreeView {tree} onSelected={handleTreeItemSelected} on:toggle={handleVisibilityToggle} />
        </div>

        <Resizer direction="vertical" />

        <div class="bottom-split-view-container">
          {#if app}
            <div class="noselect" style:display="flex" style:flex-direction="column">
              {#each selectedComponents as component}
                {#if component.type === CameraType.Orthographic || component.type === CameraType.Perspective}
                  <CameraEditor model={cameraViewModel} />
                {:else if component.type === ComponentType.Transform}
                  <TransformEditor {component} />
                {:else if component.type === ComponentType.Geometry}
                  <GeometryComponent model={geometryViewModel} />
                {:else if component.type === ComponentType.Material}
                  <MaterialEditor model={materialViewModel} />
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <Resizer direction="horizontal" />

    <div class="right-split-view-container">
      {#if webGPUSupported}
        <div class="canvas-container">
          <canvas bind:this={canvas} />
        </div>
      {:else}
        <div class="unsupported-container">
          <p>WebGPU is not supported by your browser!</p>
        </div>
      {/if}
    </div>
  </div>
</div>
