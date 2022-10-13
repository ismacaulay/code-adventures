<script lang="ts">
  import Resizer from 'components/Resizer.svelte';

  import TreeView from 'components/TreeView.svelte';

  import { onMount } from 'svelte';
  import { createWebGPUApplication } from 'toolkit/application/webgpu';
  import type { WebGPUApplication } from 'types/application/WebGPUApplication';
  import type { TreeViewNode } from 'types/components/tree';
  import { ComponentType } from 'types/ecs/component';
  import type { ReadonlySceneGraphNode } from 'types/sceneGraph';

  let app: Maybe<WebGPUApplication>;
  let canvas: HTMLCanvasElement;
  let tree: Maybe<TreeViewNode>;

  function handleTreeItemSelected(uid: string) {
    if (!app) {
      return;
    }

    console.log('[handleTreeItemSelected]', uid);
    const transform = app.entityManager.getComponent(uid, ComponentType.Transform);
    if (transform) {
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

  .split-view-container {
    height: 100vh;
    display: flex;
    flex-direction: row;
  }

  .horizontal-split-view-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
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
  <div class="split-view-container">
    <div class="horizontal-split-view-container" style:width="25%">
      <div style:height="50%">
        <TreeView title="Scene" {tree} onSelected={handleTreeItemSelected} />
      </div>

      <Resizer direction="vertical" />

      <div style="flex: 1 1 0%;">
        <span>Properties</span>
      </div>
    </div>

    <Resizer direction="horizontal" />

    <div style="flex: 1 1 0%;">
      <canvas bind:this={canvas} />
    </div>
  </div>
</div>
