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

  let transparent: Maybe<Writable<boolean>>;
  let opacity: Maybe<Writable<number>>;
  let colour: Maybe<Writable<string>>;

  $: {
    transparent = model.transparent;

    if (
      model.type === MaterialComponentType.MeshBasic ||
      model.type === MaterialComponentType.MeshDiffuse
    ) {
      opacity = model.opacity;
      colour = model.colour;
    } else {
      opacity = undefined;
      colour = undefined;
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
    {#if transparent}
      <div class="inputContainer">
        <span class="label">transparent:</span>
        <input type="checkbox" bind:checked={$transparent} />
      </div>
    {/if}
    {#if opacity}
      <div class="inputContainer">
        <span class="label">opacity:</span>
        <div>
          <input class="input" type="range" min={0} max={1} step={0.1} bind:value={$opacity} />
        </div>
        <span>{$opacity}</span>
      </div>
    {/if}

    {#if colour}
      <div class="inputContainer">
        <span class="label">colour:</span>
        <input type="color" bind:value={$colour} />
      </div>
    {/if}
  </div>
</Component>
