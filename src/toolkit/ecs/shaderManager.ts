import { UniformType, type UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import {
  cloneShader,
  createShader,
  ShaderBindingType,
  type Shader,
  type ShaderBindGroupEntry,
  type ShaderBindingDescriptor,
  type ShaderDescriptor,
} from 'toolkit/rendering/shader';
import { DefaultBuffers, type BufferManager } from './bufferManager';
import type { Texture, TextureManager } from './textureManager';

export enum DefaultShaders {
  MeshBasic = 0,
  MeshDiffuse = 1,

  Count,
}

export interface ShaderManager {
  get<T extends Shader>(id: number): T;

  create(id: DefaultShaders): number;
  create(descriptor: ShaderDescriptor): number;

  clone(id: number, bindings: ShaderBindingDescriptor[]): number;
  destroy(): void;
}

export function createShaderManager(
  device: GPUDevice,
  {
    bufferManager,
    textureManager,
  }: { bufferManager: BufferManager; textureManager: TextureManager },
): ShaderManager {
  let storage: GenericObject<Shader> = {};
  let next = DefaultShaders.Count;

  function create(id: DefaultShaders): number;
  function create(descriptor: ShaderDescriptor): number;
  function create(param: DefaultShaders | ShaderDescriptor): number {
    let descriptor: Maybe<ShaderDescriptor>;
    if (typeof param === 'number') {
      if (param === DefaultShaders.MeshBasic) {
        descriptor = getMeshBasicShaderDescriptor();
      } else if (param === DefaultShaders.MeshDiffuse) {
        descriptor = getMeshDiffuseShaderDescriptor();
      } else {
        throw new Error('Unknown DefaultShaders value');
      }
    } else {
      descriptor = param;
    }

    if ('bindings' in descriptor) {
      const { bindings, uniformBuffers, textures } = processBindings(descriptor.bindings, {
        bufferManager,
        textureManager,
      });

      storage[next] = createShader(next, device, descriptor, bindings, uniformBuffers, textures);
    }
    return next++;
  }

  return {
    create,

    get<T extends Shader>(id: number) {
      const shader = storage[id];
      if (!shader) {
        if (id === DefaultShaders.MeshBasic) {
          // storage[id] = c;
        }

        throw new Error(`Unknown shader id: ${id}`);
      }

      return shader as T;
    },

    clone(id: number, bindingDescriptors: ShaderBindingDescriptor[]) {
      const shader = storage[id];
      if (!shader) {
        throw new Error(`Unknown shader: ${id}`);
      }

      const { bindings, uniformBuffers, textures } = processBindings(bindingDescriptors, {
        bufferManager,
        textureManager,
      });

      storage[next] = cloneShader(shader, bindings, uniformBuffers, textures);
      storage[next].id = next;
      return next++;
    },

    destroy() {
      storage = {};
    },
  };
}

function processBindings(
  bindings: ShaderBindingDescriptor[],
  {
    bufferManager,
    textureManager,
  }: { bufferManager: BufferManager; textureManager: TextureManager },
) {
  const entries: ShaderBindGroupEntry[] = [];
  const uniformBuffers: UniformBuffer[] = [];
  const textures: Texture[] = [];

  for (let i = 0; i < bindings.length; ++i) {
    const binding = bindings[i];
    if (binding.type === ShaderBindingType.UniformBuffer) {
      if (binding.resource === undefined) {
        binding.resource = bufferManager.createUniformBuffer(binding.descriptor, binding.values);
      }

      const buffer = bufferManager.get<UniformBuffer>(binding.resource);
      if (binding.resource >= DefaultBuffers.Count) {
        uniformBuffers.push(buffer);
      }

      entries.push({ resource: { buffer: buffer.buffer } });
    } else if (binding.type === ShaderBindingType.Texture2D) {
      if (binding.resource === undefined) {
        throw new Error(`[ShaderManager] texture resource is undefined`);
      }

      const { texture, sampler } = textureManager.get(binding.resource);
      textures.push(texture);
      entries.push(
        {
          resource: sampler,
        },
        {
          resource: texture.texture.createView(),
        },
      );
    } else {
      throw new Error(`Unknown binding type: ${(binding as any).type}`);
    }
  }

  return {
    bindings: entries.length > 0 ? [{ entries }] : [],
    uniformBuffers,
    textures,
  };
}

function getMeshBasicShaderDescriptor(): ShaderDescriptor {
  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,
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

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>) -> VertexOutput {
  var output : VertexOutput;
  output.position = matrices.projection * matrices.view * ubo.model * vec4<f32>(position, 1.0);
  return output;
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
    bindings: [
      {
        type: ShaderBindingType.UniformBuffer,
        descriptor: {
          model: UniformType.Mat4,
          colour: UniformType.Vec3,
        },
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

function getMeshDiffuseShaderDescriptor(): ShaderDescriptor {
  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,
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

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) position_eye: vec4<f32>,
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>) -> VertexOutput {
  var out : VertexOutput;
  out.position = matrices.projection * matrices.view * ubo.model * vec4<f32>(position, 1.0);
  out.position_eye = matrices.view * ubo.model * vec4<f32>(position, 1.0);
  return out;
}

// TODO: Turn the lights into part of the scene graph
const light1 = vec4<f32>(0.33, 0.25, 0.9, 0.75);
const light2 = vec4<f32>(-0.55, -0.25, -0.79, 0.75);
const MIN_DIFFUSE = 0.3;

@fragment
fn fragment_main(@location(0) position_eye: vec4<f32>) -> @location(0) vec4<f32> {
  // compute diffuse only shading. The diffuse coefficents are all the same
  // in the light w component
  var kd = 0.0;
  var normal = normalize(cross(dpdx(position_eye.xyz), dpdy(position_eye.xyz)));
  kd = kd + light1.w * max(dot(normal, normalize(light1.xyz)), MIN_DIFFUSE);
  kd = kd + light2.w * max(dot(normal, normalize(light2.xyz)), MIN_DIFFUSE);

  return vec4<f32>(kd * ubo.colour, 1.0);
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
    bindings: [
      {
        type: ShaderBindingType.UniformBuffer,
        descriptor: {
          model: UniformType.Mat4,
          colour: UniformType.Vec3,
        },
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
