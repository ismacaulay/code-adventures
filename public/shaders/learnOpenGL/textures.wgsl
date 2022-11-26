struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) color: vec3<f32>,
}

@vertex
fn vertex_main(
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) color: vec3<f32>,
) -> VertexOutput {
  var out : VertexOutput;
  out.position = vec4(position, 1.0);
  out.uv = uv;
  out.color = color;
  return out;
}

@group(0) @binding(0)
var u_sampler1: sampler;
@group(0) @binding(1)
var u_texture1: texture_2d<f32>;
@group(0) @binding(2)
var u_sampler2: sampler;
@group(0) @binding(3)
var u_texture2: texture_2d<f32>;

@fragment
fn fragment_main(
  @location(0) uv: vec2<f32>,
  @location(1) color: vec3<f32>,
) -> @location(0) vec4<f32> {
  return
    vec4<f32>(color, 1.0) *
    mix(
      textureSample(u_texture1, u_sampler1, uv),
      textureSample(u_texture2, u_sampler2, vec2<f32>(uv.x, 1.0 - uv.y)),
      0.2
    );
}
