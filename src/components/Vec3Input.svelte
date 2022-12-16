<script lang="ts">
  import type { vec3 } from 'gl-matrix';
  import { afterUpdate } from 'svelte';

  export let label = '';
  export let value: vec3;
  export let labels: [string, string, string] = ['x', 'y', 'z'];
  export let onChange: (v: vec3) => void = () => {};

  let xValue = value[0];
  let yValue = value[1];
  let zValue = value[2];

  function handleValueChanged() {
    onChange([xValue, yValue, zValue]);
  }

  afterUpdate(() => {
    xValue = value[0];
    yValue = value[1];
    zValue = value[2];
  });
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1px 0px;
    white-space: nowrap;
    min-width: min-content;
  }

  .label {
    min-width: 75px;
    max-width: 75px;
  }

  .inputContainer {
    padding-left: 3px;
  }

  .input {
    width: 65px;
  }
</style>

<div class="container">
  <span class="label">{label}:</span>
  <div class="inputContainer">
    <span>{labels[0]}:</span><input
      class="input"
      type="number"
      bind:value={xValue}
      on:input={handleValueChanged}
    />
  </div>
  <div class="inputContainer">
    <span>{labels[1]}:</span><input
      class="input"
      type="number"
      bind:value={yValue}
      on:input={handleValueChanged}
    />
  </div>
  <div class="inputContainer">
    <span>{labels[2]}:</span><input
      class="input"
      type="number"
      bind:value={zValue}
      on:input={handleValueChanged}
    />
  </div>
</div>
