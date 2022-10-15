<script lang="ts">
  import type { TransformComponent } from 'types/ecs/component';
  import Component from './Component.svelte';
  import Vec3Input from './Vec3Input.svelte';

  export let component: TransformComponent;
</script>

<style>
</style>

<Component title="Transform">
  <div>
    <Vec3Input
      label="Position"
      xValue={component.position[0]}
      yValue={component.position[1]}
      zValue={component.position[2]}
    />
    <Vec3Input
      label="Rotation"
      xValue={component.rotation[0]}
      yValue={component.rotation[1]}
      zValue={component.rotation[2]}
    />
    <Vec3Input
      label="Scale"
      xValue={component.scale[0]}
      yValue={component.scale[1]}
      zValue={component.scale[2]}
    />
  </div>
</Component>
