<script lang="ts">
  import router from 'page';
  import Home from './pages/Home.svelte';
  import pages from './pages';

  let component: any;
  let params: any;
  let base = '';

  router(`${base}/`, () => {
    component = Home;
    params = {};
  });

  function addRoutes(pages: any) {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      if (page.section) {
        addRoutes(page.pages);
      } else if (page.url) {
        router(`${base}/${page.url}`, () => {
          component = page.component;
          params = page.params ?? {};
        });
      }
    }
  }

  Object.values(pages).forEach(addRoutes);

  router.start();
</script>

<style>
  .container {
    width: 100vw;
    height: 100vh;
  }
</style>

<svelte:head>
  <title>code adventures</title>
</svelte:head>

<div class="container">
  <svelte:component this={component} {...params} />
</div>
