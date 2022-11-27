<script lang="ts">
  import { CameraType } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import type { CameraViewModel } from '../models/camera';
  import Component from 'components/Component.svelte';

  export let model: CameraViewModel;

  const cameraType = model.cameraType;
  const controlType = model.controlType;
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
  <!-- common
  <Vec3Input label="Position" value={position} />
  <Vec3Input label="Target" value={target} />
  <Vec3Input label="Up" value={up} />
  -->

  <!-- camera specific -->
</Component>
