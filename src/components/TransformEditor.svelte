<script lang="ts">
  import { vec3 } from 'gl-matrix';
  import { isAxisRotation } from 'toolkit/math/rotation';

  import type { TransformComponent } from 'types/ecs/component';
  import Component from './Component.svelte';
  import FloatInput from './FloatInput.svelte';
  import Vec3Input from './Vec3Input.svelte';

  export let component: TransformComponent;

  function handlePositionChanged(v: vec3) {
    if (component.position) {
      vec3.copy(component.position, v);
      component.updateMatrix();
    }
  }

  function handleRotationChanged(v: vec3) {
    if (component.rotation) {
      if (!isAxisRotation(component.rotation)) {
        vec3.copy(component.rotation, v);
        component.updateMatrix();
      }
    }
  }

  function handleScaleChanged(v: vec3) {
    if (component.scale) {
      vec3.copy(component.scale, v);
      component.updateMatrix();
    }
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
    padding-left: 10px;
  }
</style>

<Component title="Transform">
  <div>
    {#if component.position}
      <Vec3Input label="Position" value={component.position} onChange={handlePositionChanged} />
    {/if}

    {#if component.rotation}
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
    {/if}

    {#if component.scale}
      <Vec3Input label="Scale" value={component.scale} onChange={handleScaleChanged} />
    {/if}
  </div>
</Component>
