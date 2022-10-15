<script lang="ts">
  import type { TransformComponent } from 'types/ecs/component';
  import Vec3Input from './Vec3Input.svelte';

  export let component: TransformComponent;

  let collapsed = false;
  function handleHeaderClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    collapsed = !collapsed;
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }

  .header {
    width: 100%;
    height: 16px;
    display: flex;
    min-width: 360px;
  }

  .arrowContainer {
    padding: 0px 3px 0 3px;
    height: 16px;
    width: 16px;
  }

  .arrow-icn {
    width: 16px;
    height: 16px;
    font-size: 10px;
    transform-origin: center;
    text-align: center;
    padding-bottom: 1px;
  }
  .rotated {
    transform: rotate(90deg);
  }

  .contentContainer {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }
</style>

<div class="container noselect">
  <div class="header" on:click={handleHeaderClick}>
    <div class="arrowContainer">
      <div class="arrow-icn {!collapsed ? 'rotated' : ''}">▶</div>
    </div>
    <span>Transform</span>
  </div>

  {#if !collapsed}
    <div class="contentContainer">
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
  {/if}
</div>
