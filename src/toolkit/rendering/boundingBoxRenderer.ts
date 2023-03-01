import { mat4, vec3 } from 'gl-matrix';
import { DefaultBuffers, type BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import { computeBoundingBoxCentre, type BoundingBox } from 'toolkit/geometry/boundingBox';
import type { IndexBuffer } from './buffers/indexBuffer';
import { UniformType } from './buffers/uniformBuffer';
import {
  BufferAttributeFormat,
  VertexBufferStepMode,
  type VertexBuffer,
} from './buffers/vertexBuffer';
import { CommandType } from './commands';
import type { Renderer } from './renderer';
import { ShaderBindingType, type SingleSourceShaderDescriptor } from './shader';

export type RenderableBoundingBox = { boundingBox: BoundingBox; transform: mat4 };

export function createBoundingBoxRenderer({
  renderer,
  bufferManager,
  shaderManager,
}: {
  renderer: Renderer;
  bufferManager: BufferManager;
  shaderManager: ShaderManager;
}) {
  const shaderDescriptor = createBoundingBoxShaderDescriptor();
  const shaderId = shaderManager.create(shaderDescriptor);

  // prettier-ignore
  const vertices = new Float64Array([
    -1, -1, 1, 
    1, -1, 1,
    1, 1, 1,
    -1, 1, 1,

    -1, -1, -1, 
    1, -1, -1,
    1, 1, -1,
    -1, 1, -1,
  ]);
  const linesVertexBufferId = bufferManager.createVertexBuffer({
    array: vertices,
    attributes: [
      {
        location: 0,
        format: BufferAttributeFormat.Float32x3,
      },
    ],
  });
  const linesVertexBuffer = bufferManager.get<VertexBuffer>(linesVertexBufferId);

  // prettier-ignore
  const indices = new Uint32Array([
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7,
  ])
  const linesIndexBufferId = bufferManager.createIndexBuffer({
    array: indices,
  });
  const linesIndexBuffer = bufferManager.get<IndexBuffer>(linesIndexBufferId);

  let transforms = new Float64Array(0);
  let transformsBuffer: number;

  const diff = vec3.create();
  const matrix = mat4.create();

  const shader = shaderManager.get(shaderId);

  return {
    render(boundingBoxes: RenderableBoundingBox[]) {
      if (boundingBoxes.length > transforms.length / 16) {
        transforms = new Float64Array(boundingBoxes.length * 16);
        transformsBuffer = bufferManager.createVertexBuffer({
          array: transforms,
          stepMode: VertexBufferStepMode.Instance,
          attributes: [
            {
              location: 1,
              format: BufferAttributeFormat.Float32x4,
            },
            {
              location: 2,
              format: BufferAttributeFormat.Float32x4,
            },
            {
              location: 3,
              format: BufferAttributeFormat.Float32x4,
            },
            {
              location: 4,
              format: BufferAttributeFormat.Float32x4,
            },
          ],
        });
      }

      boundingBoxes.forEach((bb, idx) => {
        mat4.copy(matrix, bb.transform);

        const centre = computeBoundingBoxCentre(bb.boundingBox);
        mat4.translate(matrix, matrix, centre);

        vec3.sub(diff, bb.boundingBox.max, bb.boundingBox.min);
        vec3.scale(diff, diff, 0.5);
        mat4.scale(matrix, matrix, diff);

        transforms.set(matrix, idx * 16);
      });

      const transformsVertexBuffer = bufferManager.get<VertexBuffer>(transformsBuffer);
      renderer.submit({
        type: CommandType.WriteBuffer,
        src: transforms,
        dst: transformsVertexBuffer.buffer,
      });

      renderer.submit({
        type: CommandType.Draw,
        shader,
        indices: linesIndexBuffer,
        buffers: [linesVertexBuffer, transformsVertexBuffer],
        count: indices.length,
        instances: boundingBoxes.length,
        transparent: false,
      });
    },
  };
}

function createBoundingBoxShaderDescriptor(): SingleSourceShaderDescriptor {
  const shaderSource = `
struct UBO {
  colour: vec3<f32>,
}

struct Matrices {
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> ubo: UBO;
@group(0) @binding(1)
var<uniform> matrices: Matrices;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) model_1: vec4<f32>,
  @location(2) model_2: vec4<f32>,
  @location(3) model_3: vec4<f32>,
  @location(4) model_4: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vertex_main(attrs: VertexInput) -> VertexOutput {
  var model = mat4x4<f32>(attrs.model_1, attrs.model_2, attrs.model_3, attrs.model_4);

  var out: VertexOutput;
  out.position = matrices.projection * matrices.view * model * vec4<f32>(attrs.position, 1.0);
  return out;
}

@fragment
fn fragment_main() -> @location(0) vec4<f32> {
  return vec4<f32>(ubo.colour, 1.0);
}
`;

  return {
    source: shaderSource,
    vertex: {
      entryPoint: 'vertex_main',
    },
    fragment: {
      entryPoint: 'fragment_main',
    },
    topology: 'line-list',
    // blend: {
    //   color: {
    //     srcFactor: 'src-alpha',
    //     dstFactor: 'one-minus-src-alpha',
    //   },
    //   alpha: {
    //     srcFactor: 'src-alpha',
    //     dstFactor: 'one-minus-src-alpha',
    //   },
    // },
    bindings: [
      {
        type: ShaderBindingType.UniformBuffer,
        descriptor: {
          colour: UniformType.Vec3,
        },
        values: {
          colour: [0.0, 1.0, 0.0],
        }
      },
      {
        type: ShaderBindingType.UniformBuffer,
        resource: DefaultBuffers.ViewProjection,
        descriptor: {
          view: UniformType.Mat4,
          projection: UniformType.Mat4,
        },
      },
    ],
  };
}
