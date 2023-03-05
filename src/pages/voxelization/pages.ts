import Voxelization from './Voxelization.svelte'

function toUrl(path: string) {
  return `voxelization/${path}`;
}

export default [
  {
    url: toUrl('bunny'),
    title: 'bunny',
    component: Voxelization,
  },
];
