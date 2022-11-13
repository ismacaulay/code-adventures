<script lang="ts">
  import { vec3 } from 'gl-matrix';

  import type { MaterialComponent } from 'types/ecs/component';
  import Component from './Component.svelte';

  export let component: MaterialComponent;

  function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  function rgbToHex(rgb: vec3) {
    return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  }

  function hexToRgb(hex: string): Maybe<vec3> {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : undefined;
  }

  let colour = rgbToHex(component.colour);

  function handleColourChanged() {
    const rgb = hexToRgb(colour);
    if (rgb) {
      vec3.copy(component.colour, rgb);
    }
  }
</script>

<style>
  .inputContainer {
    display: flex;
    padding-left: 3px;
    align-items: center;
  }

  .label {
    padding-right: 5px;
  }
</style>

<Component title="Material">
  <div class="inputContainer">
    <span class="label">Colour:</span>
    <input type="color" bind:value={colour} on:input={handleColourChanged} />
  </div>
</Component>
