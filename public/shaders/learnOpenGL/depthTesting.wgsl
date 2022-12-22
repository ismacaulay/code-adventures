struct UBO {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> ubo: UBO;

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertex_main(
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
) -> VertexOut {
  var out : VertexOut;
  out.position = ubo.projection * ubo.view * ubo.model * vec4<f32>(position, 1.0);
  out.uv = uv;
  return out;
}

@group(0) @binding(1)
var u_sampler: sampler;
@group(0) @binding(2)
var u_texture: texture_2d<f32>;

@fragment
fn fragment_main(
  @builtin(position) frag_coord: vec4<f32>,
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {

  var mode: u32 = 0;

  if(mode == 1) {
    return vec4(frag_coord.z, frag_coord.z, frag_coord.z, 1.0);
  }

  if (mode == 2) {
    var near = 0.1;
    var far  = 100.0;
    // convert to NDC
    var ndc = frag_coord.z * 2.0 - 1.0;
    // reverse the projection
    var linear_depth = ((2.0 * near * far) / (far + near - ndc * (far - near))) / far;
    return vec4(linear_depth, linear_depth, linear_depth, 1.0);
  }

  return textureSample(u_texture, u_sampler, uv);
}
