<script lang="ts">
  import { vec3 } from 'gl-matrix';

  import type { TransformComponent } from 'types/ecs/component';
  import Component from './Component.svelte';
  import Vec3Input from './Vec3Input.svelte';

  export let component: TransformComponent;

  function handlePositionChanged(v: vec3) {
    vec3.copy(component.position, v);
    component.updateMatrix();
  }

  function handleRotationChanged(v: vec3) {
    vec3.copy(component.rotation, v);
    component.updateMatrix();
  }

  function handleScaleChanged(v: vec3) {
    vec3.copy(component.scale, v);
    component.updateMatrix();
  }
</script>

<style>
</style>

<Component title="Transform">
  <div>
    <Vec3Input label="Position" value={component.position} onChange={handlePositionChanged} />
    <Vec3Input label="Rotation" value={component.rotation} onChange={handleRotationChanged} />
    <Vec3Input label="Scale" value={component.scale} onChange={handleScaleChanged} />
  </div>
</Component>
