<script lang="ts">
  import router from 'page';
  import Home from './pages/Home.svelte';
  import computationalGeometry from './pages/computationalGeometry/pages';
  import webgpu from './pages/webgpu/pages';

  let component: any;
  let base = '';

  router(`${base}/`, () => (component = Home));

  function addRoutes(pages: any) {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      router(`${base}/${page.url}`, () => (component = page.component));
    }
  }

  addRoutes(computationalGeometry);
  addRoutes(webgpu);
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
