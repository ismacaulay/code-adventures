<script lang="ts">
  export let label = '';

  export let xLabel = 'x';
  export let xValue: number;

  export let yLabel = 'y';
  export let yValue: number;

  export let zLabel = 'z';
  export let zValue: number;
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
    <span>{xLabel}:</span><input class="input" type="number" value={xValue} />
  </div>
  <div class="inputContainer">
    <span>{yLabel}:</span><input class="input" type="number" value={yValue} />
  </div>
  <div class="inputContainer">
    <span>{zLabel}:</span><input class="input" type="number" value={zValue} />
  </div>
</div>
