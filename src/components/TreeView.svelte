<script lang="ts">
  import type { TreeViewNode } from 'types/components/tree';
  import TreeNode from './TreeNode.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let tree: Maybe<TreeViewNode>;
  export let onSelected: (uid: string) => void;

  let selected = '';

  function handleSelected(uid: string) {
    selected = uid;
    onSelected(selected);
  }

  // TODO: allow arrow key input
  // function handleClick(e: Event) {
  //   // e.stopPropagation();
  //   // e.preventDefault();
  // }

  function handleToggle(e: CustomEvent) {
    dispatch('toggle', e.detail);
  }
</script>

<style>
  .container {
    height: 100%;
  }
</style>

<div class="container noselect">
  {#if tree}
    {#each tree.children as node}
      <TreeNode
        text={node.uid}
        children={node.children}
        level={0}
        {selected}
        onSelected={handleSelected}
        checked={node.checked}
        on:toggle={handleToggle}
      />
    {/each}
  {/if}
</div>
