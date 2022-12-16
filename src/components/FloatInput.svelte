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
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
  }

  .label {
    min-width: 75px;
    max-width: 75px;
  }

  .input {
    min-width: 65px;
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
