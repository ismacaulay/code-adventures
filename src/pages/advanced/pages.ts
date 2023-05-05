import Meshlets from './meshlets/Meshlets.svelte';

function toUrl(path: string) {
  return `advanced/${path}`;
}

export default [
  {
    url: toUrl('meshlets'),
    title: 'meshlets',
    component: Meshlets,
  },
];
