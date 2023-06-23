<script lang="ts">
  import PageList from './PageList.svelte';

  export let title: string;
  export let pages: any;
</script>

<style>
  .container {
    margin-bottom: 20px;
  }

  /* h1 { */
  /*   font-weight: 300; */
  /*   margin: 0 0 0.5em 0; */
  /* } */
</style>

<div class="container">
  <h1 class="font-light text-2xl">{title}</h1>

  <slot />

  <PageList {pages} />
</div>
