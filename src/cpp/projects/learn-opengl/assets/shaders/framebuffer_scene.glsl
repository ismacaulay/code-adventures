#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_uv;

uniform mat4 u_model;
uniform mat4 u_view_projection;

out vec2 v_uv;

void main()
{
    v_uv = a_uv;
    gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
in vec2 v_uv;

uniform sampler2D u_texture1;

out vec4 frag_color;

void main()
{
    frag_color = texture(u_texture1, v_uv);
}
#endif
