<script lang="ts">
  import type { GeometryViewModel } from 'pages/webgpu/models/geometry';
  import Component from './Component.svelte';
  import { GeometryComponentType } from 'types/ecs/component';
  import BufferGeometryComponent from './geometry/BufferGeometryComponent.svelte';
  import ClusterGeometryComponent from './geometry/ClusterGeometryComponent.svelte';

  export let model: GeometryViewModel;
</script>

<Component title="Geometry">
  {#if model.type === GeometryComponentType.Buffer}
    <BufferGeometryComponent {model} />
  {:else if model.type === GeometryComponentType.Cluster}
    <ClusterGeometryComponent {model} />
  {/if}
</Component>
