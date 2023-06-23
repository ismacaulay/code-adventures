<script lang="ts">
  import PageList from './PageList.svelte';

  export let title: string;
  export let pages: any;
</script>

<style>
</style>

<div class="mb-5">
  <h1 class="text-2xl">{title}</h1>

  <slot />

  <PageList {pages} />
</div>
