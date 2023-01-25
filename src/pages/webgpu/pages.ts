import WebGPUScene from './components/WebGPUScene.svelte';
function toUrl(path: string) {
  return `webgpu/${path}`;
}

function learnOpenGLPage(uid: string) {
  return {
    url: toUrl(`learnOpenGL/${uid}`),
    title: uid,
    component: WebGPUScene,
    params: {
      scene: `/scenes/learnOpenGL/${uid}.json`,
    },
  };
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
      learnOpenGLPage('1-triangle'),
      learnOpenGLPage('2-textures'),
      learnOpenGLPage('3-coordinates'),
      learnOpenGLPage('4-camera'),
      learnOpenGLPage('5-materials'),
      learnOpenGLPage('6-lightMaps'),
      learnOpenGLPage('7-multipleLights'),
      learnOpenGLPage('8-depthTesting'),
      learnOpenGLPage('9-blending'),
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
