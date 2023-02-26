<script>
  import ComputationalGeometry from './computationalGeometry/index.svelte';
  import WebGPU from './webgpu/index.svelte';
  import Wasm from './wasm/index.svelte';
</script>

<style>
  .container {
    margin: 1em auto;
    max-width: 750px;
  }
</style>

<div class="container">
  <WebGPU />
  <Wasm />
  <ComputationalGeometry />
</div>
