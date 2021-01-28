#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_uv;

out vec2 v_uv;

uniform mat4 u_model;
uniform mat4 u_view_projection;

void main()
{
    v_uv = a_uv;
    gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
out vec4 frag_color;

in vec2 v_uv;

uniform sampler2D u_texture1;

float near = 0.1;
float far  = 100.0;

float linearize_depth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main()
{
    /* frag_color = texture(u_texture1, v_uv); */
    /* frag_color = vec4(vec3(gl_FragCoord.z), 1.0); */
    frag_color = vec4(vec3(linearize_depth(gl_FragCoord.z) / far), 1.0);
}
#endif
