import type { vec3 } from 'gl-matrix';
import { loadObj } from 'toolkit/loaders/objLoader';
import Voxelization from './Voxelization.svelte';

function toUrl(path: string) {
  return `voxelization/${path}`;
}

export default [
  {
    url: toUrl('bunny'),
    title: 'bunny',
    component: Voxelization,
    params: {
      id: 'bunny',
      loader: async function loadBunny() {
        return loadObj('/models/bunny.obj').then((data) => {
          data.vertices = data.vertices.map((v) => v * 1000);
          return { data, camera: { position: [0, 0, 250] as vec3, zoom: 0.01 } };
        });
      },
    },
  },
  {
    url: toUrl('dragon'),
    title: 'dragon',
    component: Voxelization,
    params: {
      id: 'dragon',
      loader: async function loadDragon() {
        return loadObj('/models/dragon.obj').then((data) => {
          return { data, camera: { position: [0, 0, -250] as vec3, zoom: 0.025 } };
        });
      },
    },
  },
];
