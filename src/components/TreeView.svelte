<script lang="ts">
  import type { TreeViewNode } from 'types/components/tree';
  import TreeNode from './TreeNode.svelte';

  export let title: string;
  export let tree: Maybe<TreeViewNode>;
  export let onSelected: (uid: string) => void;

  let selected = '';

  function handleSelected(uid: string) {
    selected = uid;
    onSelected(uid);
  }

  function handleClick(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    selected = '';
  }
</script>

<div style:height="100%" on:click={handleClick}>
  <span>{title}</span>
  {#if tree}
    {#each tree.children as node}
      <TreeNode
        text={node.uid}
        children={node.children}
        level={1}
        {selected}
        onSelected={handleSelected}
      />
    {/each}
  {/if}
</div>
