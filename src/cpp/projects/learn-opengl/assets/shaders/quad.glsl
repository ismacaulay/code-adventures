#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

out vec2 v_uv;

void main()
{
    gl_Position = vec4(a_position.x, a_position.y, 0.0, 1.0);
    v_uv = a_uv;
}
#endif

#ifdef FRAGMENT_SHADER
in vec2 v_uv;

uniform sampler2D u_screen_tex;

out vec4 frag_color;

void main()
{
    frag_color = texture(u_screen_tex, v_uv);
}
#endif
