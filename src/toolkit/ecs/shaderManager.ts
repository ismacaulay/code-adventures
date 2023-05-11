import { UniformType, type UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import { RendererType, type Renderer } from 'toolkit/rendering/renderer';
import {
  cloneShader,
  createShader,
  isShaderDescriptor,
  ShaderBindingType,
  type Shader,
  type ShaderBindGroupEntry,
  type ShaderBindingDescriptor,
  type ShaderDescriptor,
  type WeightedBlendedShaderDescriptor,
} from 'toolkit/rendering/shader';
import {
  createDefaultLineBasicShaderDescriptor,
  createWeightedBlendedLineBasicShaderDescriptor,
} from 'toolkit/rendering/shaders/lineBasicShader';
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
  LineBasic = 3,

  BoundingBox = 4,

  Count,
}

export interface ShaderManager {
  get<T extends Shader>(id: number): T;

  create(id: DefaultShaders): ShaderId;
  create(descriptor: ShaderDescriptor): number;

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
  function create(descriptor: ShaderDescriptor): number;
  function create(param: DefaultShaders | ShaderDescriptor): ShaderId {
    let descriptor: Maybe<ShaderDescriptor | WeightedBlendedShaderDescriptor>;
    if (typeof param === 'number') {
      if (renderer.type === RendererType.Default) {
        descriptor = createDefaultRendererShaderDescriptor(param);
      } else {
        descriptor = createWeightedBlendedShaderDescriptor(param);
      }
    } else {
      descriptor = param;
    }

    if (isShaderDescriptor(descriptor)) {
      const { bindings, uniformBuffers, textures } = processBindings(descriptor.bindings, {
        bufferManager,
        textureManager,
      });

      storage[next] = createShader(next, device, descriptor, bindings, uniformBuffers, textures);
      return next++;
    }

    const { opaque, transparent } = descriptor;
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

      storage[next] = createShader(next, device, transparent, bindings, uniformBuffers, textures);
      result.transparent = next;
      next++;
    }
    return result;
  }

  return {
    create,

    get<T extends Shader>(id: number) {
      const shader = storage[id];
      if (!shader) {
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

function createDefaultRendererShaderDescriptor(param: DefaultShaders) {
  switch (param) {
    case DefaultShaders.MeshBasic: {
      return createDefaultMeshBasicShaderDescriptor();
    }
    case DefaultShaders.MeshDiffuse: {
      return createDefaultMeshDiffuseShaderDescriptor();
    }
    case DefaultShaders.LineBasic: {
      return createDefaultLineBasicShaderDescriptor();
    }

    default:
  }
  throw new Error(`[createDefaultRendererShaderDescriptor] Unknown param: ${param}`);
}

function createWeightedBlendedShaderDescriptor(param: DefaultShaders) {
  switch (param) {
    case DefaultShaders.MeshBasic: {
      return createWeightedBlendedMeshBasicShaderDescriptor();
    }
    case DefaultShaders.MeshDiffuse: {
      return createWeightedBlendedMeshDiffuseShaderDescriptor();
    }
    case DefaultShaders.LineBasic: {
      return createWeightedBlendedLineBasicShaderDescriptor();
    }

    default:
  }
  throw new Error(`[createWeightedBlendedShaderDescriptor] Unknown param: ${param}`);
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
