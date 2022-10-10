<script>
  import router from 'page';
  import Home from './pages/Home.svelte';
  import computationalGeometry from './pages/computationalGeometry/pages';

  let component;
  let base = '';

  router(`${base}/`, () => (component = Home));

  function addRoutes(pages) {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      router(`${base}/${page.url}`, () => (component = page.component));
    }
  }

  addRoutes(computationalGeometry);
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
  <svelte:component this={component} />
</div>
