<script>
  import ComputationalGeometry from './computationalGeometry/index.svelte';
  import ComputerGraphics from './computerGraphics/index.svelte';
  import Wasm from './wasm/index.svelte';
  import Voxelization from './voxelization/index.svelte';
</script>

<style>
  .container {
    margin: 1em auto;
    max-width: 750px;
  }
</style>

<div class="container">
  <ComputerGraphics />
  <Voxelization />
  <Wasm />
  <ComputationalGeometry />
</div>
