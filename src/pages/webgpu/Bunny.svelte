<script lang="ts">
  import Resizer from 'components/Resizer.svelte';
  import TreeView from 'components/TreeView.svelte';
  import TransformEditor from 'components/TransformEditor.svelte';
  import GeometryComponent from 'components/GeometryComponent.svelte';

  import { onMount } from 'svelte';
  import { createWebGPUApplication, type WebGPUApplication } from 'toolkit/application/webgpu';
  import type { TreeViewNode } from 'types/components/tree';
  import { type Component, ComponentType } from 'types/ecs/component';
  import type { ReadonlySceneGraphNode } from 'types/sceneGraph';
  import { CameraType, type Camera } from 'toolkit/camera/camera';
  import OrthographicCameraEditor from 'components/OrthographicCameraEditor.svelte';

  let app: Maybe<WebGPUApplication>;
  let canvas: HTMLCanvasElement;
  let tree: Maybe<TreeViewNode>;
  let selectedComponents: (Camera | Component)[] = [];

  function handleTreeItemSelected(uid: string) {
    if (!app) {
      return;
    }

    selectedComponents = [];

    if (!uid) {
      return;
    }

    if (uid === 'camera') {
      selectedComponents.push(app.camera);
    } else {
      const entityManager = app.entityManager;

      const transform = entityManager.getComponent(uid, ComponentType.Transform);
      if (transform) {
        selectedComponents.push(transform);
      }

      const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
      if (geometry) {
        selectedComponents.push(geometry);
      }
    }
  }

  function processSceneGraphNode(node: ReadonlySceneGraphNode): TreeViewNode {
    return {
      uid: node.uid,
      children: node.children.map(processSceneGraphNode),
    };
  }

  function handleSceneGraphChanged() {
    if (!app) {
      return;
    }

    tree = processSceneGraphNode(app.sceneGraph.root);
  }

  onMount(() => {
    app = createWebGPUApplication(canvas);

    const unsubscribers: Unsubscriber[] = [];

    unsubscribers.push(app.sceneGraph.onChange(handleSceneGraphChanged));
    app.loadScene('/scenes/bunny.json');

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      app?.destroy();
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

  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<svelte:head>
  <title>Bunny</title>
</svelte:head>

<div class="container">
  <div class="horizontal-split-view-container">
    <div class="left-split-view-container">
      <div class="vertical-split-view-container">
        <div class="top-split-view-container">
          <TreeView title="Scene" {tree} onSelected={handleTreeItemSelected} />
        </div>

        <Resizer direction="vertical" />

        <div class="bottom-split-view-container">
          <div class="noselect" style:display="flex" style:flex-direction="column">
            {#each selectedComponents as component}
              {#if component.type === CameraType.Orthographic}
                <OrthographicCameraEditor camera={component} />
              {:else if component.type === ComponentType.Transform}
                <TransformEditor {component} />
              {:else if component.type === ComponentType.Geometry}
                <GeometryComponent {component} />
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>

    <Resizer direction="horizontal" />

    <div class="right-split-view-container">
      <canvas bind:this={canvas} />
    </div>
  </div>
</div>
