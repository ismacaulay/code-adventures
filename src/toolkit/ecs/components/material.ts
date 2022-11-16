import type { vec3 } from 'gl-matrix';
import type { UniformDictionary } from 'toolkit/rendering/buffers/uniformBuffer';
import type { ShaderDescriptor } from 'toolkit/rendering/shader';
import {
  ComponentType,
  MaterialComponentType,
  type MeshBasicMaterialComponent,
  type MeshDiffuseMaterialComponent,
  type RawShaderMaterialComponent,
} from 'types/ecs/component';

export function createMeshBasicMaterialComponent({
  colour,
}: {
  colour: vec3;
}): MeshBasicMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshBasic,

    colour,
  };
}

export function createMeshDiffuseMaterialComponent({
  colour,
}: {
  colour: vec3;
}): MeshDiffuseMaterialComponent {
  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.MeshDiffuse,

    colour,
  };
}

export function createRawShaderMaterialComponent(params: {
  source: string;
  vertex: { entryPoint: string };
  fragment: { entryPoint: string };
  uniforms: UniformDictionary;
}): RawShaderMaterialComponent;
export function createRawShaderMaterialComponent(params: {
  vertex: { source: string; entryPoint: string };
  fragment: { source: string; entryPoint: string };
  uniforms: UniformDictionary;
}): RawShaderMaterialComponent;
export function createRawShaderMaterialComponent(
  params:
    | {
        source: string;
        vertex: { entryPoint: string };
        fragment: { entryPoint: string };
        uniforms: UniformDictionary;
      }
    | {
        vertex: { source: string; entryPoint: string };
        fragment: { source: string; entryPoint: string };
        uniforms: UniformDictionary;
      },
): RawShaderMaterialComponent {
  let descriptor: ShaderDescriptor;

  // TODO: Convert uniforms to descriptor
  if ('source' in params) {
    descriptor = {
      source: params.source,
      vertex: params.vertex,
      fragment: params.fragment,
      bindings: [],
    };
  } else {
    descriptor = {
      vertex: params.vertex,
      fragment: params.fragment,
      bindings: [],
    };
  }

  return {
    type: ComponentType.Material,
    subtype: MaterialComponentType.RawShader,
    descriptor,
    uniforms: params.uniforms,
  };
}
