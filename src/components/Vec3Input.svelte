<script lang="ts">
  import type { vec3 } from 'gl-matrix';

  export let label = '';
  export let value: vec3 = [0, 0, 0];
  export let labels: [string, string, string] = ['x', 'y', 'z'];

  // TODO: remove onChange in favour of two way bindings
  export let onChange: (v: vec3) => void = () => {};

  let xValue: number;
  let yValue: number;
  let zValue: number;

  $: {
    xValue = value[0];
    yValue = value[1];
    zValue = value[2];
  }

  function update() {
    value = [xValue, yValue, zValue];
    onChange([xValue, yValue, zValue]);
  }

  function handleXValueChanged(e: any) {
    if (e.currentTarget) {
      xValue = e.currentTarget.value;
      update();
    }
  }

  function handleYValueChanged(e: any) {
    if (e.currentTarget) {
      yValue = e.currentTarget.value;
      update();
    }
  }

  function handleZValueChanged(e: any) {
    if (e.currentTarget) {
      zValue = e.currentTarget.value;
      update();
    }
  }
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
      value={xValue}
      on:input={handleXValueChanged}
    />
  </div>
  <div class="inputContainer">
    <span>{labels[1]}:</span><input
      class="input"
      type="number"
      value={yValue}
      on:input={handleYValueChanged}
    />
  </div>
  <div class="inputContainer">
    <span>{labels[2]}:</span><input
      class="input"
      type="number"
      value={zValue}
      on:input={handleZValueChanged}
    />
  </div>
</div>
