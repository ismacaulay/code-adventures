struct UBO {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,

  view_position: vec3<f32>,

  mat_ambient: vec3<f32>,
  mat_diffuse: vec3<f32>,
  mat_specular: vec3<f32>,
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
}

@vertex
fn vertex_main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
  var out : VertexOutput;
  out.position = ubo.projection * ubo.view * ubo.model * vec4<f32>(position, 1.0);
  out.position_world = ubo.model * vec4<f32>(position, 1.0);
  out.normal = normal;
  return out;
}

@fragment
fn fragment_main(
  @location(0) position_world: vec4<f32>,
  @location(1) normal: vec3<f32>
) -> @location(0) vec4<f32> {
  var ambient = ubo.light_ambient * ubo.mat_ambient;

  var n = normalize(normal);
  var light_dir = normalize(ubo.light_position - position_world.xyz);
  var diff = max(dot(n, light_dir), 0.0);
  var diffuse = ubo.light_diffuse * diff * ubo.mat_diffuse;

  var view_dir = normalize(ubo.view_position - position_world.xyz);
  var reflect_dir = reflect(-light_dir, n);  
  var spec = pow(max(dot(view_dir, reflect_dir), 0.0), ubo.mat_shininess);
  var specular = ubo.light_specular * spec * ubo.mat_specular;  

  return vec4<f32>(ambient + diffuse + specular, 1.0);
}
