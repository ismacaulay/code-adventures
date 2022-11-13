<script lang="ts">
  import type { OrthographicCamera } from 'toolkit/camera/camera';
  import Component from './Component.svelte';
  import Vec3Input from './Vec3Input.svelte';

  export let camera: OrthographicCamera;
</script>

<Component title="Camera">
  <Vec3Input label="Position" value={camera.position} />
  <Vec3Input label="Target" value={camera.target} />
  <Vec3Input label="Up" value={camera.up} />
</Component>
