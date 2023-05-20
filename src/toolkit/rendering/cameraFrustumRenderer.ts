import { mat4, vec3 } from 'gl-matrix';
import type { CameraController } from 'toolkit/camera/cameraController';
import { DefaultBuffers, type BufferManager } from 'toolkit/ecs/bufferManager';
import type { ShaderManager } from 'toolkit/ecs/shaderManager';
import type { IndexBuffer } from './buffers/indexBuffer';
import { UniformType } from './buffers/uniformBuffer';
import { BufferAttributeFormat, type VertexBuffer } from './buffers/vertexBuffer';
import { CommandType } from './commands';
import type { Renderer } from './renderer';
import { ShaderBindingType, type SingleSourceShaderDescriptor } from './shader';

export function createCameraFrustumRenderer(params: {
  cameraController: CameraController;
  renderer: Renderer;
  bufferManager: BufferManager;
  shaderManager: ShaderManager;
}) {
  const { cameraController, renderer, bufferManager, shaderManager } = params;

  // take the clip space coordinates and unproject them
  // back into view space based on the camera inverse projection
  // matrix

  const vertices = new Float32Array(3 * 12);

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
    // frustum box
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7,
    // connect to p
    0, 8, 1, 8, 2, 8, 3, 8,
    // up arrow
    9, 10, 10, 11, 11, 9
  ]);
  const linesIndexBufferId = bufferManager.createIndexBuffer({
    array: indices,
  });
  const linesIndexBuffer = bufferManager.get<IndexBuffer>(linesIndexBufferId);

  const shaderId = shaderManager.create(createShaderDescriptor());
  const shader = shaderManager.get(shaderId);

  const n0: vec3 = vertices.subarray(0, 3);
  const n1: vec3 = vertices.subarray(3, 6);
  const n2: vec3 = vertices.subarray(6, 9);
  const n3: vec3 = vertices.subarray(9, 12);

  const f0: vec3 = vertices.subarray(12, 15);
  const f1: vec3 = vertices.subarray(15, 18);
  const f2: vec3 = vertices.subarray(18, 21);
  const f3: vec3 = vertices.subarray(21, 24);

  const p: vec3 = vertices.subarray(24, 27);

  const u0: vec3 = vertices.subarray(27, 30);
  const u1: vec3 = vertices.subarray(30, 33);
  const u2: vec3 = vertices.subarray(33, 36);

  const inverseProjection = mat4.create();
  const tmp = vec3.create();

  return {
    update() {
      // TODO: all of this happens reguardless of if the projection matrix changed
      mat4.invert(inverseProjection, cameraController.camera.viewProjection);

      vec3.set(tmp, -1, -1, -1);
      vec3.transformMat4(n0, tmp, inverseProjection);

      vec3.set(tmp, 1, -1, -1);
      vec3.transformMat4(n1, tmp, inverseProjection);

      vec3.set(tmp, 1, 1, -1);
      vec3.transformMat4(n2, tmp, inverseProjection);

      vec3.set(tmp, -1, 1, -1);
      vec3.transformMat4(n3, tmp, inverseProjection);

      vec3.set(tmp, -1, -1, 1);
      vec3.transformMat4(f0, tmp, inverseProjection);

      vec3.set(tmp, 1, -1, 1);
      vec3.transformMat4(f1, tmp, inverseProjection);

      vec3.set(tmp, 1, 1, 1);
      vec3.transformMat4(f2, tmp, inverseProjection);

      vec3.set(tmp, -1, 1, 1);
      vec3.transformMat4(f3, tmp, inverseProjection);

      vec3.set(tmp, -1, 1, 1);
      vec3.transformMat4(f3, tmp, inverseProjection);

      vec3.copy(p, cameraController.position);

      vec3.set(tmp, -0.7, 1.1, -1);
      vec3.transformMat4(u0, tmp, inverseProjection);

      vec3.set(tmp, 0.7, 1.1, -1);
      vec3.transformMat4(u1, tmp, inverseProjection);

      vec3.set(tmp, 0, 1.7, -1);
      vec3.transformMat4(u2, tmp, inverseProjection);
    },

    render() {
      // TODO: This is going to happen all the time
      renderer.submit({
        type: CommandType.WriteBuffer,
        src: vertices,
        dst: linesVertexBuffer.buffer,
      });

      shader.buffers.forEach((buf) => {
        renderer.submit({
          type: CommandType.WriteBuffer,
          src: buf.data,
          dst: buf.buffer,
        });
      });

      renderer.submit({
        type: CommandType.Draw,
        shader,
        indices: linesIndexBuffer,
        buffers: [linesVertexBuffer],
        count: indices.length,
        instances: 1,
        transparent: false,
      });
    },

    destroy() {
      bufferManager.destroy(linesIndexBufferId);
      bufferManager.destroy(linesVertexBufferId);
    },
  };
}

function createShaderDescriptor(): SingleSourceShaderDescriptor {
  const shaderSource = `
struct Matrices {
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> matrices: Matrices;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.position = matrices.projection * matrices.view * vec4<f32>(position, 1.0);
  return out;
}

@fragment
fn fragment_main() -> @location(0) vec4<f32> {
  return vec4<f32>(0.0, 0.0, 0.0, 1.0);
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
