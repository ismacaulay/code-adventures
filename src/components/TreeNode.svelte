<script lang="ts">
  import type { TreeViewNode } from 'types/components/tree';

  export let text: string;
  export let children: TreeViewNode[];
  export let level: number;
  export let onSelected: (uid: string) => void;

  function handleClicked() {
    onSelected(text);
  }
</script>

<style>
</style>

<div style:margin-left="{level * 10}px">
  <span on:click={handleClicked}>{text}</span>
  {#each children as node}
    <svelte:self text={node.uid} children={node.children} level={level + 1} {onSelected} />
  {/each}
</div>
