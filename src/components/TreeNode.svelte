<script lang="ts">
  import type { TreeViewNode } from 'types/components/tree';

  export let text: string;
  export let children: TreeViewNode[];
  export let level: number;
  export let selected: string;
  export let onSelected: (uid: string) => void;

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    onSelected(text);
  }
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
</style>

<div>
  <div class={selected === text ? 'selected' : ''} style:padding-left="{level * 10}px">
    <span class="noselect" on:click={handleClick}>{text}</span>
  </div>
  {#each children as node}
    <svelte:self text={node.uid} children={node.children} level={level + 1} {selected} {onSelected} />
  {/each}
</div>
