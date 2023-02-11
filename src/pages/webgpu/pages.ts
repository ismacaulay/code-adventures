import WebGPUScene from './components/WebGPUScene.svelte';
function toUrl(path: string) {
  return `webgpu/${path}`;
}

function learnOpenGLPage(uid: string, params?: { title?: string }) {
  return {
    url: toUrl(`learnOpenGL/${uid}`),
    title: params?.title ?? uid,
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
      of a graphics api.
    `,
    pages: [
      learnOpenGLPage('1-triangle'),
      learnOpenGLPage('2-textures'),
      learnOpenGLPage('3-coordinates'),
      learnOpenGLPage('4-camera'),
      learnOpenGLPage('5-materials'),
      learnOpenGLPage('6-lightmaps'),
      learnOpenGLPage('6_1-lightmaps-emission', { title: '6.1-emission lightmaps' }),
      learnOpenGLPage('7-multipleLights', { title: '7-multiple lights' }),
      learnOpenGLPage('8-depthTesting', { title: '8-depth testing' }),
      learnOpenGLPage('9-blending'),
    ],
  },
  {
    section: 'Transparency',
    pages: [
      {
        section: 'Weighted Blended Order-Independent Transparency',
        pages: [
          {
            url: toUrl('transparency/cubes'),
            title: 'Cubes',
            component: WebGPUScene,
            params: {
              scene: '/scenes/transparency/wboit/cubes.json',
            },
          },
        ],
      },
      // {
      //   section: 'Depth Peeling',
      //   description: 'Coming Soon!',
      //   pages: [],
      // },
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
