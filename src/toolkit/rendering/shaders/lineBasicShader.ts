import { DefaultBuffers } from 'toolkit/ecs/bufferManager';
import { UniformType } from '../buffers/uniformBuffer';
import { ShaderBindingType, type ShaderBindingDescriptor, type ShaderDescriptor } from '../shader';

export function createDefaultLineBasicShaderDescriptor(): ShaderDescriptor {
  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,
  opacity: f32,
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
  return vec4<f32>(ubo.colour, ubo.opacity);
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
    blend: {
      color: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
      },
      alpha: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
      },
    },
    topology: 'line-list',
    bindings: [
      {
        type: ShaderBindingType.UniformBuffer,
        descriptor: {
          model: UniformType.Mat4,
          opacity: UniformType.Scalar,
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

export function createWeightedBlendedLineBasicShaderDescriptor() {
  const shaderSource = `
struct UBO {
  model: mat4x4<f32>,
  opacity: f32,
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

@fragment
fn fragment_opaque_main(
  @builtin(position) frag_coord: vec4<f32>,
  @location(0) position_eye: vec4<f32>,
) -> @location(0) vec4<f32> {
  return vec4<f32>(ubo.colour, 1.0);
}

struct FragmentOutput {
  @location(0) accum: vec4<f32>,
  @location(1) reveal: f32,
}

@fragment
fn fragment_transparent_main(
  @builtin(position) frag_coord: vec4<f32>,
  @location(0) position_eye: vec4<f32>,
) -> FragmentOutput {
  var colour = ubo.colour;
  var opacity = ubo.opacity;
  var frag_depth = frag_coord.z;

  // equation 9
  // var abs_z_over_200 = abs(position_eye.z) / 200.0;
  // var weight = opacity * max(1e-2, min(3e3, 0.03 / (1e-5 + (abs_z_over_200 * abs_z_over_200 * abs_z_over_200 * abs_z_over_200))));

  // equation 10
  var one_minus_dz = 1.0 - frag_coord.z;
  var weight = opacity * max(1e-2, 3e3 * (one_minus_dz * one_minus_dz * one_minus_dz));

  var out: FragmentOutput;
  out.accum = vec4<f32>(colour * opacity, opacity) * weight;
  out.reveal = opacity;
  return out;
}
`;

  // TODO: this is probably going to cause 2 uniform buffers to be created.
  //       should they be the same buffer?
  const bindings: ShaderBindingDescriptor[] = [
    {
      type: ShaderBindingType.UniformBuffer,
      descriptor: {
        model: UniformType.Mat4,
        opacity: UniformType.Scalar,
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
  ];

  return {
    opaque: {
      source: shaderSource,
      vertex: {
        entryPoint: 'vertex_main',
      },
      fragment: {
        entryPoint: 'fragment_opaque_main',
      },
      bindings,
      topology: 'line-list',
    },
    transparent: {
      source: shaderSource,
      vertex: {
        entryPoint: 'vertex_main',
      },
      fragment: {
        entryPoint: 'fragment_transparent_main',
      },
      bindings,
      topology: 'line-list',
    },
  };
}
