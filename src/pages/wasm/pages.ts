import WasmGameOfLife from './WasmGameOfLife.svelte';

function toUrl(path: string) {
  return `wasm/${path}`;
}

export default [
  {
    url: toUrl('game-of-life'),
    title: 'game of life',
    component: WasmGameOfLife,
  },
];
