import type { vec3 } from 'gl-matrix';
import { UniformType } from 'toolkit/rendering/buffers/uniformBuffer';
import { ShaderBindingType } from 'toolkit/rendering/shader';
import {
  ComponentType,
  MaterialComponentType,
  type BasicMaterialComponent,
  type MeshBasicMaterialComponent,
} from 'types/ecs/component';
import { DefaultBuffers } from '../bufferManager';

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

export function createBasicMaterialComponent({ colour }: { colour: vec3 }): BasicMaterialComponent {
  return {
    type: ComponentType.Material,

    shader: {
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
    },

    uniforms: {
      colour: colour.map((c) => c / 255.0),
    },
  };
}

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
