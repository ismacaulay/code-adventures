<script lang="ts">
  import type { GeometryViewModel } from 'pages/webgpu/models/geometry';
  import type { Writable } from 'svelte/store';
  import type { BoundingBox } from 'toolkit/geometry/boundingBox';
  import Component from './Component.svelte';

  export let model: GeometryViewModel;

  let triangles: number;
  let buffers: number;
  let boundingBox: BoundingBox;
  let showBoundingBox: Writable<boolean>;

  function handleKeypress(e: KeyboardEvent) {
    e.preventDefault();
  }

  $: {
    triangles = model.triangles;
    buffers = model.buffers;
    boundingBox = model.boundingBox;
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

  .boundingBoxContainer {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
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

    <div>
      <span class="label">bounding box:</span>
      <div class="boundingBoxContainer">
        <span>min: {boundingBox.min[0]} {boundingBox.min[1]} {boundingBox.min[2]}</span>
        <span>max: {boundingBox.max[0]} {boundingBox.max[1]} {boundingBox.max[2]}</span>
        <div class="inputContainer">
          <span class="label">show:</span>
          <input type="checkbox" on:keydown={handleKeypress} bind:checked={$showBoundingBox} />
        </div>
      </div>
    </div>
  </div>
</Component>
