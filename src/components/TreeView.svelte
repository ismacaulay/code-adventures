<script lang="ts">
  import type { TreeViewNode } from 'types/components/tree';
  import TreeNode from './TreeNode.svelte';

  export let title: string;
  export let tree: TreeViewNode[];
  export let onSelected: (uid: string) => void;
</script>

<div>
  <span>{title}</span>
  {#each tree as node}
    <TreeNode text={node.uid} children={node.children} level={1} {onSelected} />
  {/each}
</div>
