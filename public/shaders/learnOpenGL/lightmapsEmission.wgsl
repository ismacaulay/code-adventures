struct UBO {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,

  view_position: vec3<f32>,

  mat_shininess: f32,

  light_position: vec3<f32>,
  light_ambient: vec3<f32>,
  light_diffuse: vec3<f32>,
  light_specular: vec3<f32>,
}

@group(0) @binding(0)
var<uniform> ubo: UBO;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) position_world: vec4<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
}

@vertex
fn vertex_main(
    @location(0) position: vec3<f32>, 
    @location(1) normal: vec3<f32>, 
    @location(2) uv: vec2<f32>
) -> VertexOutput {
  var out : VertexOutput;
  out.position = ubo.projection * ubo.view * ubo.model * vec4<f32>(position, 1.0);
  out.position_world = ubo.model * vec4<f32>(position, 1.0);
  out.normal = normal;
  out.uv = uv;
  return out;
}

@group(0) @binding(1)
var sampler_diffuse: sampler;
@group(0) @binding(2)
var tex_diffuse: texture_2d<f32>;
@group(0) @binding(3)
var sampler_specular: sampler;
@group(0) @binding(4)
var tex_specular: texture_2d<f32>;
@group(0) @binding(5)
var sampler_emission: sampler;
@group(0) @binding(6)
var tex_emission: texture_2d<f32>;

@fragment
fn fragment_main(
  @location(0) position_world: vec4<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>
) -> @location(0) vec4<f32> {
  var diffuse_colour = textureSample(tex_diffuse, sampler_diffuse, uv).xyz;
  var specular_colour = textureSample(tex_specular, sampler_specular, uv).xyz;
  var emission_colour = textureSample(tex_emission, sampler_emission, uv).xyz;

  var ambient = ubo.light_ambient * diffuse_colour;

  var n = normalize(normal);
  var light_dir = normalize(ubo.light_position - position_world.xyz);
  var diff = max(dot(n, light_dir), 0.0);
  var diffuse = ubo.light_diffuse * diff * diffuse_colour;

  var view_dir = normalize(ubo.view_position - position_world.xyz);
  var reflect_dir = reflect(-light_dir, n);  
  var spec = pow(max(dot(view_dir, reflect_dir), 0.0), ubo.mat_shininess);
  var specular = ubo.light_specular * spec * specular_colour;

  var result = ambient + diffuse + specular;
  if (all(specular_colour == vec3<f32>(0.0))) {
    result += emission_colour;
  }

  return vec4<f32>(result, 1.0);
}
