<script lang="ts">
  import type { vec3 } from 'gl-matrix';
  import type { MaterialViewModel } from 'pages/webgpu/models/material';
  import { get, type Writable } from 'svelte/store';

  import { MaterialComponentType } from 'types/ecs/component';
  import Component from './Component.svelte';

  export let model: MaterialViewModel;

  function componentToHex(c: number) {
    var hex = Math.floor(c * 255).toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  function rgbToHex(rgb: vec3) {
    return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  }

  function hexToRgb(hex: string): Maybe<vec3> {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : undefined;
  }

  let transparent: Writable<boolean>;
  let opacity: Writable<number>;
  let colour: string;

  $: {
    transparent = model.transparent;
    opacity = model.opacity;
    colour = rgbToHex(get(model.colour));
  }

  function handleColourInput() {
    const rgb = hexToRgb(colour);
    if (rgb) {
      model.colour.set(rgb);
    }
  }

  // TODO: display shader path for RawShaderMaterial
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    /* padding-left: 3px; */
    /* align-items: center; */
  }

  .inputContainer {
    display: flex;
    flex-direction: row;
    /* padding-left: 3px; */
    align-items: center;
  }

  .label {
    padding-right: 5px;
  }
</style>

<Component title="Material">
  <div class="container">
    {#if model.type === MaterialComponentType.MeshDiffuse}
      <div class="inputContainer">
        <span class="label">transparent:</span>
        <input type="checkbox" bind:checked={$transparent} />
      </div>
      <div class="inputContainer">
        <span class="label">opacity:</span>
        <div>
          <input class="input" type="range" min={0} max={1} step={0.1} bind:value={$opacity} />
        </div>
        <span>{$opacity}</span>
      </div>
      <div class="inputContainer">
        <span class="label">colour:</span>
        <input type="color" bind:value={colour} on:input={handleColourInput} />
      </div>
    {/if}
  </div>
</Component>
