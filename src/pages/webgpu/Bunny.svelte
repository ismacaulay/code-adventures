<script lang="ts">
  import Resizer from 'components/Resizer.svelte';

  import TreeView from 'components/TreeView.svelte';

  import { onMount } from 'svelte';
  import { createWebGPUApplication } from 'toolkit/application/webgpu';
  import type { TreeViewNode } from 'types/components/tree';
  import type { ReadOnlySceneGraphNode } from 'types/sceneGraph';

  let canvas: HTMLCanvasElement;
  let tree: TreeViewNode[] = [];

  onMount(() => {
    const app = createWebGPUApplication(canvas);

    app.loadScene('/scenes/bunny.json');

    const unsubscribers = [];

    function processSceneGraphNode(node: ReadOnlySceneGraphNode) {
      return node.children.reduce((acc, cur) => {
        acc.push({ uid: cur.uid, children: cur.children.map(processSceneGraphNode) });
        return acc;
      }, []);
    }

    function handleSceneGraphChanged() {
      console.log('scene graph changed');

      tree = processSceneGraphNode(app.sceneGraph.root);
      console.log(tree);
    }

    unsubscribers.push(app.sceneGraph.onChange(handleSceneGraphChanged));

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      app.destroy();
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
        <TreeView title="Scene" {tree} />
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
