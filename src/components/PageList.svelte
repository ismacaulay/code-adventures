<script lang="ts">
  export let pages: any;
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

{#each pages as page}
  {#if page.section}
    <h3>{page.section}</h3>
    {#if page.description}
      <p>{@html page.description}</p>
    {/if}
    <svelte:self pages={page.pages} />
  {:else if page.url}
    <a class="nav-link" href="/{page.url}">{page.title}</a>
  {/if}
{/each}
