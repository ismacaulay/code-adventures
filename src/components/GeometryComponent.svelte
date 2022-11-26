<script lang="ts">
  import type { GeometryComponent } from 'types/ecs/component';
  import Component from './Component.svelte';

  export let component: GeometryComponent;
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }
</style>

<Component title="Geometry">
  <div class="container">
    <span>
      Triangles: {component.count}
    </span>

    <span>
      Buffers: {component.buffers.length}
    </span>
  </div>
</Component>
