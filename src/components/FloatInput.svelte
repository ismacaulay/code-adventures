<script lang="ts">
  export let label = '';
  export let value: number;
  export let onChange: (v: number) => void = () => {};

  function handleValueChanged() {
    onChange(value);
  }
</script>

<style>
  .inputContainer {
    padding-left: 3px;
  }

  .label {
    min-width: 75px;
    max-width: 75px;
  }

  .input {
    width: 65px;
  }
</style>

<div class="inputContainer">
  <span class="label">{label}:</span><input
    class="input"
    type="number"
    bind:value
    on:input={handleValueChanged}
  />
</div>
