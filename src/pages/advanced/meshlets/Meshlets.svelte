<script lang="ts">
  import WebGpuScene from 'pages/webgpu/components/WebGPUScene.svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { fetchBinary } from 'toolkit/network';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { createTransformComponent } from 'toolkit/ecs/components/transform';
  import { mat4, vec3 } from 'gl-matrix';
  import {
    createMeshDiffuseMaterialComponent,
    createRawShaderMaterialComponent,
  } from 'toolkit/ecs/components/material';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { CameraType, type OrthographicCamera } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { UniformType } from 'toolkit/rendering/buffers/uniformBuffer';

  let app: Maybe<WebGPUApplication>;

  $: {
    if (app) {
      run(app);
    }
  }

  const base = '/generated/bunny';

  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> ubo: UBO;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) position_eye: vec4<f32>,
  @location(1) @interpolate(flat) colour: u32,
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>, @location(1) colour: u32) -> VertexOutput {
  var out : VertexOutput;
  out.position = ubo.projection * ubo.view * ubo.model * vec4<f32>(position, 1.0);
  out.position_eye = ubo.view * ubo.model * vec4<f32>(position, 1.0);
  out.colour = colour;
  return out;
}

// TODO: Turn the lights into part of the scene graph
const light1 = vec4<f32>(0.33, 0.25, 0.9, 0.75);
const light2 = vec4<f32>(-0.55, -0.25, -0.79, 0.75);
const MIN_DIFFUSE = 0.3;

@fragment
fn fragment_main(@location(0) position_eye: vec4<f32>, @location(1) @interpolate(flat) colour: u32) -> @location(0) vec4<f32> {
  // compute diffuse only shading. The diffuse coefficents are all the same
  // in the light w component
  var kd = 0.0;
  var normal = normalize(cross(dpdx(position_eye.xyz), dpdy(position_eye.xyz)));
  kd = kd + light1.w * max(dot(normal, normalize(light1.xyz)), MIN_DIFFUSE);
  kd = kd + light2.w * max(dot(normal, normalize(light2.xyz)), MIN_DIFFUSE);

  var r = f32(colour & 0xff) / 255.0;
  var g = f32((colour & (0xff << 8)) >> 8) / 255.0;
  var b = f32((colour & (0xff << 16)) >> 16) / 255.0;
  var a = f32((colour & (0xff << 24)) >> 24) / 255.0;

  return vec4<f32>(kd * vec3<f32>(r, g, b), a);
}
`;

  async function run(app: WebGPUApplication) {
    const [verticesBuf, trianglesBuf, coloursBuf, boundsBuf, countsBuf] = await Promise.all([
      fetchBinary(`${base}/vertices.bin`),
      fetchBinary(`${base}/triangles.bin`),
      fetchBinary(`${base}/colours.bin`),
      fetchBinary(`${base}/bounds.bin`),
      fetchBinary(`${base}/counts.bin`),
    ]);

    const name = 'bunny';
    const vertices = new Float32Array(verticesBuf);
    const triangles = new Uint32Array(trianglesBuf);
    const colours = new Uint32Array(coloursBuf);
    const bounds = new Float32Array(boundsBuf);
    const counts = new Uint32Array(countsBuf);

    // const meshletCount = bounds.length / 4; // { centre: vec3, radius: float }
    // console.log(bounds, meshletCount);
    console.log(counts, counts.length / 4);

    const { cameraController, entityManager, sceneGraph } = app;

    entityManager.add(name);

    const transform = createTransformComponent({});
    entityManager.addComponent(name, transform);

    const material = createRawShaderMaterialComponent({
      source: shaderSource,
      vertex: { entryPoint: 'vertex_main' },
      fragment: { entryPoint: 'fragment_main' },
      uniforms: {
        descriptor: {
          model: UniformType.Mat4,
          view: UniformType.Mat4,
          projection: UniformType.Mat4,
        },
        values: {
          model: mat4.create(),
          view: mat4.create(),
          projection: mat4.create(),
        },
      },
    });
    entityManager.addComponent(name, material);

    const boundingBox = BoundingBox.fromVertices(vertices);
    const geometry = createBufferGeometryComponent({
      boundingBox,
      count: triangles.length,
      indices: triangles,
      buffers: [
        {
          array: vertices,
          attributes: [
            {
              format: BufferAttributeFormat.Float32x3,
              location: 0,
            },
          ],
        },
        {
          array: colours,
          attributes: [
            {
              format: BufferAttributeFormat.Uint32,
              location: 1,
            },
          ],
        },
      ],
    });
    entityManager.addComponent(name, geometry);
    sceneGraph.root.add(createSceneGraphNode({ uid: name }));

    cameraController.cameraType = CameraType.Orthographic;
    cameraController.controlType = CameraControlType.Orbit;
    cameraController.position = [0, 0, 1];
    (cameraController.camera as OrthographicCamera).zoom = 12;
    cameraController.camera.updateProjectionMatrix();

    const result = BoundingBox.centre(boundingBox);
    cameraController.target = vec3.clone(result);
  }
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.Default }} />
