<script lang="ts">
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

  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<svelte:head>
  <title>Bunny</title>
</svelte:head>

<div class="container">
  <TreeView title="Scene" {tree} />
  <canvas bind:this={canvas} />
</div>
