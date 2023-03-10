#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_tex_coords;

uniform mat4 u_view_projection;
uniform mat4 u_model;

out vec2 v_tex_coords;

void main()
{
    v_tex_coords = a_tex_coords;
    gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
in vec2 v_tex_coords;

uniform sampler2D u_texture_0;

out vec4 frag_color;

void main()
{

    frag_color = texture(u_texture_0, v_tex_coords);
    // frag_color = vec4(0.7, 0.3, 0.2, 1.0);
}
#endif
