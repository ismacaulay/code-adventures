import type { Texture } from 'toolkit/ecs/textureManager';
import type {
  UniformBuffer,
  UniformBufferDescriptor,
  UniformDictionary,
} from './buffers/uniformBuffer';

interface BufferBindGroupEntry {
  resource: {
    buffer: GPUBuffer;
  };
}

interface SamplerBindGroupEntry {
  resource: GPUSampler;
}

interface TextureBindGroupEntry {
  resource: GPUTextureView;
}

export type ShaderBindGroupEntry =
  | BufferBindGroupEntry
  | SamplerBindGroupEntry
  | TextureBindGroupEntry;

export interface ShaderBindGroupDescriptor {
  entries: ShaderBindGroupEntry[];
}

interface BaseShader {
  id: number;
}

export interface Shader extends BaseShader {
  vertex: { module: GPUShaderModule; entryPoint: string };
  fragment: { module: GPUShaderModule; entryPoint: string };

  bindings: ShaderBindGroupDescriptor[];
  buffers: UniformBuffer[];
  textures: Texture[];
  blend?: GPUBlendState;
  topology?: GPUPrimitiveTopology;

  update(uniforms: UniformDictionary): void;
}

export enum ShaderBindingType {
  UniformBuffer,
  Texture2D,
}

interface BaseShaderBindingDescriptor {
  type: ShaderBindingType;
  resource?: number;
}

export interface UniformBufferBindingDescriptor extends BaseShaderBindingDescriptor {
  type: ShaderBindingType.UniformBuffer;
  descriptor: UniformBufferDescriptor;
  values?: UniformDictionary;
}

export interface Texture2DBindingDescriptor extends BaseShaderBindingDescriptor {
  type: ShaderBindingType.Texture2D;
}

export type ShaderBindingDescriptor = UniformBufferBindingDescriptor | Texture2DBindingDescriptor;

interface BaseShaderDescriptor {
  id?: number;
  bindings: ShaderBindingDescriptor[];
  blend?: GPUBlendState;
  topology?: GPUPrimitiveTopology;
}

export interface SingleSourceShaderDescriptor extends BaseShaderDescriptor {
  source: string;
  vertex: {
    entryPoint: string;
  };
  fragment: {
    entryPoint: string;
  };
}

export interface MultiSourceShaderDescriptor extends BaseShaderDescriptor {
  vertex: {
    source: string;
    entryPoint: string;
  };
  fragment: {
    source: string;
    entryPoint: string;
  };
}

export type ShaderDescriptor = SingleSourceShaderDescriptor | MultiSourceShaderDescriptor;

export function createShader(
  id: number,
  device: GPUDevice,
  descriptor: ShaderDescriptor,
  bindings: ShaderBindGroupDescriptor[],
  buffers: UniformBuffer[],
  textures: Texture[],
): Shader {
  let vertexModule: GPUShaderModule;
  let fragmentModule: GPUShaderModule;

  if (!('vertex' in descriptor) || !('fragment' in descriptor)) {
    throw new Error('Unable to build shader: no vertex or fragment in descriptor');
  }

  if ('source' in descriptor) {
    vertexModule = device.createShaderModule({
      code: descriptor.source,
    });
    fragmentModule = vertexModule;
  } else {
    vertexModule = device.createShaderModule({
      code: descriptor.vertex.source,
    });
    fragmentModule = device.createShaderModule({
      code: descriptor.fragment.source,
    });
  }

  const vertex = {
    module: vertexModule,
    entryPoint: descriptor.vertex.entryPoint,
  };

  const fragment = {
    module: fragmentModule,
    entryPoint: descriptor.fragment.entryPoint,
  };

  return buildShader({
    id,
    vertex,
    fragment,
    bindings,
    buffers,
    textures,
    blend: descriptor.blend,
    topology: descriptor.topology,
  });
}

export function cloneShader(
  shader: Shader,
  bindings: ShaderBindGroupDescriptor[],
  buffers: UniformBuffer[],
  textures: Texture[],
): Shader {
  const { id, vertex, fragment } = shader;

  return buildShader({ id, vertex, fragment, bindings, buffers, textures });
}

function buildShader({
  id,
  vertex,
  fragment,
  bindings,
  buffers,
  textures,
  blend,
  topology,
}: {
  id: number;
  vertex: { module: GPUShaderModule; entryPoint: string };
  fragment: { module: GPUShaderModule; entryPoint: string };
  bindings: ShaderBindGroupDescriptor[];
  buffers: UniformBuffer[];
  textures: Texture[];
  blend?: GPUBlendState;
  topology?: GPUPrimitiveTopology;
}): Shader {
  return {
    id,
    vertex,
    fragment,
    bindings,
    buffers,
    textures,
    blend,
    topology,

    update(uniforms: UniformDictionary) {
      updateBuffers(buffers, uniforms);
    },
  };
}

function updateBuffers(buffers: UniformBuffer[], uniforms: UniformDictionary) {
  Object.entries(uniforms).forEach(([name, value]) => {
    let found = false;
    for (let i = 0; i < buffers.length; ++i) {
      const buffer = buffers[i];
      if (buffer.hasUniform(name)) {
        buffer.updateUniform(name, value);

        found = true;
        break;
      }
    }

    if (!found) {
      console.warn(`[shader] Tried to update unknown uniform: ${name}`);
    }
  });
}
