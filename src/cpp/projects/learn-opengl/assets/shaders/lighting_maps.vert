#version 330 core
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_tex_coord;

uniform mat4 u_view_projection;
uniform mat4 u_model;

out vec3 v_normal;
out vec3 v_frag_pos;
out vec2 v_tex_coords;

void main()
{
    // TODO: Do this CPU side as its expensive
    v_normal = mat3(transpose(inverse(u_model))) * a_normal;
    v_frag_pos = vec3(u_model * vec4(a_position, 1.0));
    v_tex_coords = a_tex_coord;

    gl_Position = u_view_projection * vec4(v_frag_pos, 1.0);
}

