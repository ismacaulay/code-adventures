import { UniformType, type UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import { RendererType, type Renderer } from 'toolkit/rendering/renderer';
import {
  cloneShader,
  createShader,
  ShaderBindingType,
  type Shader,
  type ShaderBindGroupEntry,
  type ShaderBindingDescriptor,
  type ShaderDescriptor,
} from 'toolkit/rendering/shader';
import {
  createDefaultMeshBasicShaderDescriptor,
  createWeightedBlendedMeshBasicShaderDescriptor,
} from 'toolkit/rendering/shaders/meshBasicShader';
import {
  createDefaultMeshDiffuseShaderDescriptor,
  createWeightedBlendedMeshDiffuseShaderDescriptor,
} from 'toolkit/rendering/shaders/meshDiffuseShader';
import type { ShaderId } from 'types/ecs/component';
import { DefaultBuffers, type BufferManager } from './bufferManager';
import type { Texture, TextureManager } from './textureManager';

export enum DefaultShaders {
  MeshBasic = 0,
  MeshDiffuse = 1,
  MeshPhong = 2,

  Count,
}

export interface ShaderManager {
  get<T extends Shader>(id: number): T;

  create(id: DefaultShaders): ShaderId;
  create(descriptor: ShaderDescriptor): ShaderId;

  clone(id: number, bindings: ShaderBindingDescriptor[]): number;
  destroy(): void;
}

export function createShaderManager(
  device: GPUDevice,
  {
    bufferManager,
    textureManager,
    renderer,
  }: { bufferManager: BufferManager; textureManager: TextureManager; renderer: Renderer },
): ShaderManager {
  let storage: GenericObject<Shader> = {};
  let next = DefaultShaders.Count;

  function create(id: DefaultShaders): ShaderId;
  function create(descriptor: ShaderDescriptor): ShaderId;
  function create(param: DefaultShaders | ShaderDescriptor): ShaderId {
    let descriptor: Maybe<ShaderDescriptor>;
    if (typeof param === 'number') {
      if (param === DefaultShaders.MeshBasic) {
        if (renderer.type === RendererType.Default) {
          descriptor = createDefaultMeshBasicShaderDescriptor();
        } else if (renderer.type === RendererType.WeightedBlended) {
          const { opaque, transparent } = createWeightedBlendedMeshBasicShaderDescriptor();

          const result = {
            opaque: -1,
            transparent: -1,
          };
          {
            const { bindings, uniformBuffers, textures } = processBindings(opaque.bindings, {
              bufferManager,
              textureManager,
            });

            storage[next] = createShader(next, device, opaque, bindings, uniformBuffers, textures);
            result.opaque = next;
            next++;
          }
          {
            const { bindings, uniformBuffers, textures } = processBindings(transparent.bindings, {
              bufferManager,
              textureManager,
            });

            storage[next] = createShader(
              next,
              device,
              transparent,
              bindings,
              uniformBuffers,
              textures,
            );
            result.transparent = next;
            next++;
          }
          return result;
        } else {
          throw new Error(`Unknown renderer type: ${renderer.type}`);
        }
      } else if (param === DefaultShaders.MeshDiffuse) {
        if (renderer.type === RendererType.Default) {
          descriptor = createDefaultMeshDiffuseShaderDescriptor();
        } else if (renderer.type === RendererType.WeightedBlended) {
          const { opaque, transparent } = createWeightedBlendedMeshDiffuseShaderDescriptor();

          const result = {
            opaque: -1,
            transparent: -1,
          };
          {
            const { bindings, uniformBuffers, textures } = processBindings(opaque.bindings, {
              bufferManager,
              textureManager,
            });

            storage[next] = createShader(next, device, opaque, bindings, uniformBuffers, textures);
            result.opaque = next;
            next++;
          }
          {
            const { bindings, uniformBuffers, textures } = processBindings(transparent.bindings, {
              bufferManager,
              textureManager,
            });

            storage[next] = createShader(
              next,
              device,
              transparent,
              bindings,
              uniformBuffers,
              textures,
            );
            result.transparent = next;
            next++;
          }
          return result;
        } else {
          throw new Error(`Unknown renderer type: ${renderer.type}`);
        }
      } else if (param === DefaultShaders.MeshPhong) {
        descriptor = getMeshPhongShaderDescriptor();
      } else {
        throw new Error(`Unknown DefaultShaders value: ${param}`);
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

function getMeshPhongShaderDescriptor(): ShaderDescriptor {
  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,

  // material
  diffuse: vec3<f32>,
  specular: vec3<f32>,
  shininess: f32,

  // temp lights
  light_ambient: vec3<f32>,

  light_position: vec3<f32>,
  light_colour: vec3<f32>,
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
  @location(1) normal: vec3<f32>,
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
  var out : VertexOutput;
  out.position = matrices.projection * matrices.view * ubo.model * vec4<f32>(position, 1.0);
  out.position_eye = matrices.view * ubo.model * vec4<f32>(position, 1.0);
  out.normal = normal;
  return out;
}

@fragment
fn fragment_main(
  @builtin(position) frag_position: vec4<f32>,
  @location(0) position_eye: vec4<f32>, 
  @location(1) normal: vec3<f32>
) -> @location(0) vec4<f32> {
  var n = normalize(normal);
  var light_dir = normalize(ubo.light_position - frag_position.xyz);
  var diff = max(dot(n, light_dir), 0.0);
  var diffuse = ubo.light_colour * diff * ubo.diffuse;

  var final_colour = diffuse;
  return vec4<f32>(final_colour, 1.0);

  // return vec4<f32>(abs(normal), 1.0);
  // return vec4<f32>(ubo.diffuse, 1.0);
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
          diffuse: UniformType.Vec3,
          specular: UniformType.Vec3,
          shininess: UniformType.Scalar,

          light_ambient: UniformType.Vec3,
          light_position: UniformType.Vec3,
          light_colour: UniformType.Vec3,
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
