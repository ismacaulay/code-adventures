<script lang="ts">
  import { onMount } from 'svelte';
  import { createWebGPUApplication } from 'toolkit/application/webgpu';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const app = createWebGPUApplication(canvas);

    app.loadScene('/scenes/bunny.json');

    const unsubscribers = [];

    function handleSceneGraphChanged() {
      console.log('scene graph changed');
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
  <canvas bind:this={canvas} />
</div>
