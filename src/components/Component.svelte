<script lang="ts">
  export let title: string;

  export let collapsed = false;
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
    /* min-width: 360px; */
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
    <span>{title}</span>
  </div>

  {#if !collapsed}
    <div class="contentContainer">
      <slot />
    </div>
  {/if}
</div>
