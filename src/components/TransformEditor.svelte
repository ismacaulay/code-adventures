<script lang="ts">
  import { vec3 } from 'gl-matrix';
  import { isAxisRotation } from 'toolkit/math/rotation';

  import type { TransformComponent } from 'types/ecs/component';
  import Component from './Component.svelte';
  import FloatInput from './FloatInput.svelte';
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
  .rotationContainer {
    display: flex;
    flex-direction: column;
  }

  .rotationInputContainer {
    display: flex;
    flex-direction: column;
  }
</style>

<Component title="Transform">
  <div>
    <Vec3Input label="Position" value={component.position} onChange={handlePositionChanged} />
    {#if isAxisRotation(component.rotation)}
      <!-- TODO: Make a nicer rotation input -->
      <div class="rotationContainer">
        <span>Rotation:</span>
        <div class="rotationInputContainer">
          <Vec3Input label="Axis" value={component.rotation.axis} />
          <FloatInput label="Angle" value={component.rotation.angle} />
        </div>
      </div>
    {:else}
      <Vec3Input label="Rotation" value={component.rotation} onChange={handleRotationChanged} />
    {/if}
    <Vec3Input label="Scale" value={component.scale} onChange={handleScaleChanged} />
  </div>
</Component>
