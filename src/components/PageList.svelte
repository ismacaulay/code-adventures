<script lang="ts">
  export let pages: any;
  export let subsection = false;
</script>

<style>
  .nav-link {
    display: block;
    padding: 0 10px;
  }

  a {
    text-decoration: none;
  }
  a:link,
  a:visited {
    color: #118ab2;
  }
  a:hover {
    text-decoration: underline;
  }
</style>

<div class="grid grid-cols-4 {subsection ? 'col-span-4' : ''}">
  {#each pages as page}
    {#if page.section}
      {#if subsection}
        <h3 class="text-sm col-span-4">{page.section}</h3>
      {:else}
        <h2 class="text-lg font-thin col-span-4">{page.section}</h2>
      {/if}
      {#if page.description}
        <p class="col-span-4">{@html page.description}</p>
      {/if}
      <svelte:self pages={page.pages} subsection={true} />
    {:else if page.url}
      <a class="nav-link" href="/{page.url}">{page.title}</a>
    {/if}
  {/each}
</div>
