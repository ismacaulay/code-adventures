import './app.css';
import App from './App.svelte';

if (import.meta.hot) {
  import.meta.hot.on(
    'vite:beforeUpdate',
    /* eslint-disable-next-line no-console */
    () => console.clear(),
  );
}

const app = new App({
  target: document.getElementById('app'),
});

export default app;
