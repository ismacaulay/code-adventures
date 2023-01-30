struct PointLight {
  position: vec3<f32>,

  ambient: vec3<f32>,
  diffuse: vec3<f32>,
  specular: vec3<f32>,

  constant: f32,
  linear: f32,
  quadratic: f32,
}

struct DirLight {
  direction: vec3<f32>,

  ambient: vec3<f32>,
  diffuse: vec3<f32>,
  specular: vec3<f32>,
}

struct SpotLight {
  position: vec3<f32>,
  direction: vec3<f32>,

  ambient: vec3<f32>,
  diffuse: vec3<f32>,
  specular: vec3<f32>,

  constant: f32,
  linear: f32,
  quadratic: f32,
  cut_off: f32,
  outer_cutoff: f32,
}

struct UBO {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,

  view_position: vec3<f32>,

  mat_shininess: f32,

  point_lights: array<PointLight, 4>,
  dir_light: DirLight,
  spot_light: SpotLight,
}

@group(0) @binding(0)
var<uniform> ubo: UBO;

struct VertexOut {
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
) -> VertexOut {
  var out : VertexOut;
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

@fragment
fn fragment_main(
  @location(0) position_world: vec4<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>
) -> @location(0) vec4<f32> {
  var diffuse_colour = textureSample(tex_diffuse, sampler_diffuse, uv).xyz;
  var specular_colour = textureSample(tex_specular, sampler_specular, uv).xyz;

  var n = normalize(normal);
  var view_dir = normalize(ubo.view_position - position_world.xyz);

  var result = calc_dir_light(ubo.dir_light, n, view_dir, diffuse_colour, specular_colour);

  for (var i = 0; i < 4; i++) {
    result += calc_point_light(ubo.point_lights[i], n, view_dir, position_world.xyz, diffuse_colour, specular_colour);
  }

  result += calc_spot_light(ubo.spot_light, n, view_dir, position_world.xyz, diffuse_colour, specular_colour);

  return vec4<f32>(result, 1.0);
}

fn calc_dir_light(
  light: DirLight, 
  normal: vec3<f32>, 
  view_dir: vec3<f32>, 
  diffuse_colour: vec3<f32>, 
  specular_colour: vec3<f32>
) -> vec3<f32> {
    var light_dir = normalize(-light.direction);

    // diffuse shading
    var diff = max(dot(normal, light_dir), 0.0);

    // specular shading
    var reflect_dir = reflect(-light_dir, normal);
    var spec = pow(max(dot(view_dir, reflect_dir), 0.0), ubo.mat_shininess);

    // combine results
    var ambient = light.ambient * diffuse_colour;
    var diffuse = light.diffuse * diff * diffuse_colour;
    var specular = light.specular * spec * specular_colour;

    return (ambient + diffuse + specular);
}

fn calc_point_light(
  light: PointLight,
  normal: vec3<f32>,
  view_dir: vec3<f32>,
  frag_pos: vec3<f32>,
  diffuse_colour: vec3<f32>, 
  specular_colour: vec3<f32>
) -> vec3<f32> {
  var light_dir = normalize(light.position - frag_pos);

  // diffuse shading
  var diff = max(dot(normal, light_dir), 0.0);

  // specular shading
  var reflect_dir = reflect(-light_dir, normal);
  var spec = pow(max(dot(view_dir, reflect_dir), 0.0), ubo.mat_shininess);

  // attenuation
  var distance = length(light.position - frag_pos);
  var attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

  var ambient = light.ambient * diffuse_colour;
  var diffuse = light.diffuse * diff * diffuse_colour;
  var specular = light.specular * spec * specular_colour;
  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;

  return (ambient + diffuse + specular);
}

fn calc_spot_light(
  light: SpotLight,
  normal: vec3<f32>,
  view_dir: vec3<f32>,
  frag_pos: vec3<f32>,
  diffuse_colour: vec3<f32>, 
  specular_colour: vec3<f32>
) -> vec3<f32> {
  var light_dir = normalize(light.position - frag_pos);

  // diffuse shading
  var diff = max(dot(normal, light_dir), 0.0);

  // specular shading
  var reflect_dir = reflect(-light_dir, normal);
  var spec = pow(max(dot(view_dir, reflect_dir), 0.0), ubo.mat_shininess);

  // attenuation
  var distance = length(light.position - frag_pos);
  var attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

  // intensity
  var theta = dot(light_dir, normalize(-light.direction));
  var epsilon = light.cut_off - light.outer_cutoff;
  var intensity = clamp((theta - light.outer_cutoff) / epsilon, 0.0, 1.0);

  var ambient = light.ambient * diffuse_colour;
  var diffuse = light.diffuse * diff * diffuse_colour;
  var specular = light.specular * spec * specular_colour;
  ambient *= attenuation * intensity;
  diffuse *= attenuation * intensity;
  specular *= attenuation * intensity;
  
  return (ambient + diffuse + specular);
}

