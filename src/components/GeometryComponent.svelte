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
    {#if component.indices}
      <span>
        Triangles: {component.indices.array.length}
      </span>
    {/if}

    <span>
      Buffers: {component.buffers.length}
    </span>
  </div>
</Component>
