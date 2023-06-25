<script lang="ts">
  import { CameraType } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import type { CameraViewModel } from '../models/camera';
  import Component from 'components/Component.svelte';
  import Vec3Input from 'components/Vec3Input.svelte';

  export let model: CameraViewModel;

  const { cameraType, controlType, position, target, up, near, far } = model;
</script>

<Component title="Camera">
  <!-- type -->
  <select bind:value={$cameraType}>
    <option value={CameraType.Perspective}> {CameraType.Perspective} </option>
    <option value={CameraType.Orthographic}> {CameraType.Orthographic} </option>
  </select>
  <select bind:value={$controlType}>
    <option value={CameraControlType.Free}> {CameraControlType.Free} </option>
    <option value={CameraControlType.Orbit}> {CameraControlType.Orbit} </option>
  </select>

  <!-- common -->
  <Vec3Input label="position" bind:value={$position} />
  <Vec3Input label="target" bind:value={$target} />
  <Vec3Input label="up" bind:value={$up} />

  <div class="flex flex-col">
    <span>
      near: {$near}
    </span>
    <span>
      far: {$far}
    </span>
  </div>
  <!-- camera specific -->
</Component>
