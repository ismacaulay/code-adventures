<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TreeViewNode } from 'types/components/tree';

  const dispatch = createEventDispatcher();

  export let text: string;
  export let children: TreeViewNode[];
  export let level: number;
  export let selected: string;
  export let onSelected: (uid: string) => void;

  export let checked: boolean | undefined;

  function handleClick(e: MouseEvent) {
    // e.stopPropagation();
    // e.preventDefault();
    //
    onSelected(text);
  }

  function toggle(e: Event) {
    const el = e.target as HTMLInputElement;
    if (!el) {
      return;
    }

    dispatch('toggle', {
      text,
      value: el.checked,
    });
  }

  // $: {
  //   console.log(checked);
  // }
</script>

<style>
  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    user-select: none; /* Chrome, Edge, Opera and Firefox */
  }

  .selected {
    background-color: #ccc;
  }

  .container {
    display: flex;
    align-items: center;
  }
</style>

<div>
  <div class={selected === text ? 'selected' : ''} style:padding-left="{level * 10}px">
    <div class="container">
      {#if checked !== undefined}
        <input type="checkbox" {checked} on:change={toggle} />
      {/if}
      <span class="noselect" on:click={handleClick}>{text}</span>
    </div>
  </div>
  {#each children as node}
    <svelte:self
      text={node.uid}
      children={node.children}
      level={level + 1}
      {selected}
      {onSelected}
      checked={node.checked}
    />
  {/each}
</div>
