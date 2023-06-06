<script lang="ts">
  import type { ClusterGeometryViewModel } from 'pages/webgpu/models/geometry';
  import type { Writable } from 'svelte/store';
  import type { BoundingBox } from 'toolkit/geometry/boundingBox';

  export let model: ClusterGeometryViewModel;

  let clusters: number;
  let boundingBox: BoundingBox;
  let showBoundingBox: Writable<boolean>;
  let showClusterBoundingSpheres: Writable<boolean>;

  $: {
    clusters = model.clusters;
    boundingBox = model.boundingBox;
    showBoundingBox = model.showBoundingBox;
    showClusterBoundingSpheres = model.showClusterBoundingSpheres;
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

<div class="container">
  <span>
    clusters: {clusters}
  </span>

  <div>
    <span class="label">bounding box:</span>
    <div class="boundingBoxContainer">
      <span
        >min: {boundingBox.min[0].toFixed(6)}
        {boundingBox.min[1].toFixed(6)}
        {boundingBox.min[2].toFixed(6)}</span
      >
      <span
        >max: {boundingBox.max[0].toFixed(6)}
        {boundingBox.max[1].toFixed(6)}
        {boundingBox.max[2].toFixed(6)}</span
      >
      <div class="inputContainer">
        <span class="label">show:</span>
        <input type="checkbox" on:keydown|preventDefault bind:checked={$showBoundingBox} />
      </div>
    </div>
  </div>
  <div>
    <span class="label">clusters bounds:</span>
    <div class="boundingBoxContainer">
      <div class="inputContainer">
        <span class="label">show:</span>
        <input
          type="checkbox"
          on:keydown|preventDefault
          bind:checked={$showClusterBoundingSpheres}
        />
      </div>
    </div>
  </div>
</div>
