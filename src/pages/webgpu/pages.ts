import WebGPUScene from 'components/WebGPUScene.svelte';
function toUrl(path: string) {
  return `webgpu/${path}`;
}

export default [
  {
    section: 'Learn OpenGL',
    pages: [
      {
        url: toUrl('learnOpenGL/triangle'),
        title: 'Triangle',
        component: WebGPUScene,
        params: {
          scene: '/scenes/learnOpenGL/triangle.json',
        },
      },
      {
        url: toUrl('learnOpenGL/textures'),
        title: 'Textures',
        component: WebGPUScene,
        params: {
          scene: '/scenes/learnOpenGL/textures.json',
        },
      },
    ],
  },
  {
    section: 'Other',
    pages: [
      {
        url: toUrl('bunny'),
        title: 'Bunny',
        component: WebGPUScene,
        params: {
          scene: '/scenes/bunny.json',
        },
      },
    ],
  },
];
