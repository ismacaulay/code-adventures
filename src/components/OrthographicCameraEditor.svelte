<script lang="ts">
  import type { OrthographicCamera } from 'toolkit/camera/camera';
  import Component from './Component.svelte';
  import Vec3Input from './Vec3Input.svelte';

  export let camera: OrthographicCamera;
</script>

<Component title="Camera">
  <Vec3Input
    label="Position"
    xValue={camera.position[0]}
    yValue={camera.position[1]}
    zValue={camera.position[2]}
  />
  <Vec3Input
    label="Target"
    xValue={camera.target[0]}
    yValue={camera.target[1]}
    zValue={camera.target[2]}
  />
  <Vec3Input label="Up" xValue={camera.up[0]} yValue={camera.up[1]} zValue={camera.up[2]} />
</Component>
