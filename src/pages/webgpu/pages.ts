import WebGPUScene from 'components/WebGPUScene.svelte';
function toUrl(path: string) {
  return `webgpu/${path}`;
}

export default [
  {
    section: 'Learn OpenGL',
    description: `
      Implementation of the concepts taught by
      <a href="https://www.learnopengl.com">Learn OpenGL</a>
      as they provide a nice order to learn the basic concepts
      of WebGPU.
    `,
    pages: [
      {
        url: toUrl('learnOpenGL/triangle'),
        title: 'Triangle',
        component: WebGPUScene,
        params: {
          scene: '/scenes/learnOpenGL/1-triangle.json',
        },
      },
      {
        url: toUrl('learnOpenGL/textures'),
        title: 'Textures',
        component: WebGPUScene,
        params: {
          scene: '/scenes/learnOpenGL/2-textures.json',
        },
      },
      {
        url: toUrl('learnOpenGL/instancing'),
        title: 'Coordinates',
        component: WebGPUScene,
        params: {
          scene: '/scenes/learnOpenGL/3-coordinates.json',
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
