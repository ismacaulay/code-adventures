import { mat4, vec3 } from 'gl-matrix';
import { DefaultBuffers, type BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
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

export type RenderableBoundingBox = { boundingBox: BoundingBox; transform: mat4; colour?: vec3 };

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
  ]);
  const linesIndexBufferId = bufferManager.createIndexBuffer({
    array: indices,
  });
  const linesIndexBuffer = bufferManager.get<IndexBuffer>(linesIndexBufferId);

  let transforms = new Float32Array(0);
  let transformsBuffer: number;

  let colours = new Float32Array(0);
  let coloursBuffer: number;

  const diff = vec3.create();
  const matrix = mat4.create();

  const shader = shaderManager.get(shaderId);
  let instanceCount = 0;

  return {
    setBoundingBoxes(boundingBoxes: RenderableBoundingBox[]) {
      console.log(boundingBoxes.length);
      if (boundingBoxes.length > transforms.length / 16) {
        transforms = new Float32Array(boundingBoxes.length * 16);
        if (transformsBuffer !== undefined) {
          bufferManager.destroy(transformsBuffer);
        }
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

      if (boundingBoxes.length > colours.length / 3) {
        colours = new Float32Array(boundingBoxes.length * 3);
        if (coloursBuffer !== undefined) {
          bufferManager.destroy(coloursBuffer);
        }
        coloursBuffer = bufferManager.createVertexBuffer({
          array: colours,
          stepMode: VertexBufferStepMode.Instance,
          attributes: [
            {
              location: 5,
              format: BufferAttributeFormat.Float32x3,
            },
          ],
        });
      }

      let transformsChanged = false;
      let coloursChanged = false;
      boundingBoxes.forEach((bb, idx) => {
        mat4.copy(matrix, bb.transform);

        const centre = BoundingBox.centre(bb.boundingBox);
        mat4.translate(matrix, matrix, centre);

        vec3.sub(diff, bb.boundingBox.max, bb.boundingBox.min);
        vec3.scale(diff, diff, 0.5);
        mat4.scale(matrix, matrix, diff);

        if (!mat4.equals(matrix, transforms.subarray(idx * 16, idx * 16 + 16))) {
          transforms.set(matrix, idx * 16);
          transformsChanged = true;
        }

        const colour = bb.colour ?? [0.0, 1.0, 0.0];

        if (
          colours[idx * 3] !== colour[0] ||
          colours[idx * 3 + 1] !== colour[1] ||
          colours[idx * 3 + 2] !== colour[2]
        ) {
          colours.set(colour, idx * 3);
          coloursChanged = true;
        }
      });

      const transformsVertexBuffer = bufferManager.get<VertexBuffer>(transformsBuffer);
      if (transformsChanged) {
        console.log(transformsChanged);
        renderer.submit({
          type: CommandType.WriteBuffer,
          src: transforms,
          dst: transformsVertexBuffer.buffer,
        });
      }

      const coloursVertexBuffer = bufferManager.get<VertexBuffer>(coloursBuffer);
      if (coloursChanged) {
        console.log(coloursChanged);
        renderer.submit({
          type: CommandType.WriteBuffer,
          src: colours,
          dst: coloursVertexBuffer.buffer,
        });
      }

      instanceCount = boundingBoxes.length;
    },
    render() {
      const transformsVertexBuffer = bufferManager.get<VertexBuffer>(transformsBuffer);
      const coloursVertexBuffer = bufferManager.get<VertexBuffer>(coloursBuffer);

      renderer.submit({
        type: CommandType.Draw,
        shader,
        indices: linesIndexBuffer,
        buffers: [linesVertexBuffer, transformsVertexBuffer, coloursVertexBuffer],
        count: indices.length,
        instances: instanceCount,
        transparent: false,
      });
    },
  };
}

function createBoundingBoxShaderDescriptor(): SingleSourceShaderDescriptor {
  const shaderSource = `
struct Matrices {
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> matrices: Matrices;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) model_1: vec4<f32>,
  @location(2) model_2: vec4<f32>,
  @location(3) model_3: vec4<f32>,
  @location(4) model_4: vec4<f32>,
  @location(5) colour: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) colour: vec3<f32>,
}

@vertex
fn vertex_main(attrs: VertexInput) -> VertexOutput {
  var model = mat4x4<f32>(attrs.model_1, attrs.model_2, attrs.model_3, attrs.model_4);

  var out: VertexOutput;
  out.position = matrices.projection * matrices.view * model * vec4<f32>(attrs.position, 1.0);
  out.colour = attrs.colour;
  return out;
}

@fragment
fn fragment_main(@location(0) colour: vec3<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(colour, 1.0);
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
        resource: DefaultBuffers.ViewProjection,
        descriptor: {
          view: UniformType.Mat4,
          projection: UniformType.Mat4,
        },
      },
    ],
  };
}
