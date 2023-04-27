import MoanaIsland from './MoanaIsland.svelte';

function toUrl(path: string) {
  return `moana-island/${path}`;
}

export default [
  {
    url: toUrl('scene'),
    title: 'moana island scene',
    component: MoanaIsland,
  },
];
