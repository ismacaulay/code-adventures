<script lang="ts">
  import type { GeometryViewModel } from 'pages/webgpu/models/geometry';
  import type { Writable } from 'svelte/store';
  import Component from './Component.svelte';

  export let model: GeometryViewModel;

  let triangles: number;
  let buffers: number;
  let showBoundingBox: Writable<boolean>;

  function handleKeypress(e: KeyboardEvent) {
    e.preventDefault();
  }

  $: {
    triangles = model.triangles;
    buffers = model.buffers;
    showBoundingBox = model.showBoundingBox;
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }

  .inputContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .label {
    padding-right: 5px;
  }
</style>

<Component title="Geometry">
  <div class="container">
    <span>
      triangles: {triangles}
    </span>

    <span>
      buffers: {buffers}
    </span>

    <div class="inputContainer">
      <span class="label">bounding box:</span>
      <input type="checkbox" on:keydown={handleKeypress} bind:checked={$showBoundingBox} />
    </div>
  </div>
</Component>
