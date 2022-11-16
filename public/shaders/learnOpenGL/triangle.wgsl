struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) colour: vec3<f32>,
}

@vertex
fn vertex_main(
  @location(0) position: vec3<f32>,
  @location(1) colour: vec3<f32>
) -> VertexOutput {
  var out : VertexOutput;
  out.position = vec4(position, 1.0);
  out.colour = colour;
  return out;
}

@fragment
fn fragment_main(@location(0) colour: vec3<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(colour, 1.0);
}
