import Bunny from './Bunny.svelte';

function toUrl(path: string) {
  return `webgpu/${path}`;
}

export default [
  {
    url: toUrl('bunny'),
    title: 'Bunny',
    component: Bunny,
  },
];
