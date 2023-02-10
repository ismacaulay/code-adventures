import type { vec3 } from 'gl-matrix';
import type {
  UniformBufferDescriptor,
  UniformDictionary,
} from 'toolkit/rendering/buffers/uniformBuffer';
import {
  ShaderBindingType,
  type ShaderBindingDescriptor,
  type ShaderDescriptor,
  type Texture2DBindingDescriptor,
} from 'toolkit/rendering/shader';
import {
  ComponentType,
  MaterialComponentType,
  type MeshBasicMaterialComponent,
  type MeshDiffuseMaterialComponent,
  type MeshPhongMaterialComponent,
  type RawShaderMaterialComponent,
} from 'types/ecs/component';

export function createMeshBasicMaterialComponent({
  transparent,
  opacity,
  colour,
}: {
  transparent: boolean;
  opacity: number;
  colour: vec3;
}): MeshBasicMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshBasic,

    opacity,
    colour,
    transparent,
  };
}

export function createMeshDiffuseMaterialComponent({
  transparent,
  opacity,
  colour,
}: {
  transparent: boolean;
  opacity: number;
  colour: vec3;
}): MeshDiffuseMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshDiffuse,

    opacity,
    colour,
    transparent,
  };
}

export function createMeshPhongMaterialComponent({
  diffuse,
  specular,
  shininess,
}: {
  diffuse: vec3;
  specular: vec3;
  shininess: number;
}): MeshPhongMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshPhong,

    transparent: false,

    diffuse,
    specular,
    shininess,
  };
}

export function createRawShaderMaterialComponent(params: {
  source: string;
  vertex: { entryPoint: string };
  fragment: { entryPoint: string };
  uniforms?: { descriptor: UniformBufferDescriptor; values: UniformDictionary };
  textures?: number[];
  blend?: GPUBlendState;
  transparent?: boolean;
}): RawShaderMaterialComponent;
export function createRawShaderMaterialComponent(params: {
  vertex: { source: string; entryPoint: string };
  fragment: { source: string; entryPoint: string };
  uniforms?: { descriptor: UniformBufferDescriptor; values: UniformDictionary };
  textures?: number[];
  blend?: GPUBlendState;
  transparent?: boolean;
}): RawShaderMaterialComponent;
export function createRawShaderMaterialComponent(
  params:
    | {
        source: string;
        vertex: { entryPoint: string };
        fragment: { entryPoint: string };
        uniforms?: { descriptor: UniformBufferDescriptor; values: UniformDictionary };
        textures?: number[];
        blend?: GPUBlendState;
        transparent?: boolean;
      }
    | {
        vertex: { source: string; entryPoint: string };
        fragment: { source: string; entryPoint: string };
        uniforms?: { descriptor: UniformBufferDescriptor; values: UniformDictionary };
        textures?: number[];
        blend?: GPUBlendState;
        transparent?: boolean;
      },
): RawShaderMaterialComponent {
  let descriptor: ShaderDescriptor;

  const bindings: ShaderBindingDescriptor[] = [];

  if (params.uniforms) {
    bindings.push({
      type: ShaderBindingType.UniformBuffer,
      descriptor: params.uniforms.descriptor,
      values: params.uniforms.values,
    });
  }

  if (params.textures) {
    bindings.push(
      ...params.textures.map((texture): Texture2DBindingDescriptor => {
        return {
          type: ShaderBindingType.Texture2D,
          resource: texture,
        };
      }),
    );
  }

  if ('source' in params) {
    descriptor = {
      source: params.source,
      vertex: params.vertex,
      fragment: params.fragment,
      bindings,
      blend: params.blend,
    };
  } else {
    descriptor = {
      vertex: params.vertex,
      fragment: params.fragment,
      bindings,
      blend: params.blend,
    };
  }

  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.RawShader,
    descriptor,
    uniforms: params.uniforms?.values,
    transparent: params.transparent ?? false,
  };
}
