#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in float a_texture_idx;

uniform mat4 u_view_projection;

out vec4 v_color;
out vec2 v_uv;
out float v_texture_idx;

void main()
{
    v_color = a_color;
    v_uv = a_uv;
    v_texture_idx = a_texture_idx;

    gl_Position = u_view_projection * vec4(a_position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
in vec4 v_color;
in vec2 v_uv;
in float v_texture_idx;

uniform sampler2D u_textures[32];

out vec4 frag_color;

void main()
{
    vec4 color = v_color;
    switch (int(v_texture_idx)) {
        case 0:
            color *= texture(u_textures[0], v_uv);
            break;
        case 1:
            color *= texture(u_textures[1], v_uv);
            break;
        case 2:
            color *= texture(u_textures[2], v_uv);
            break;
        case 3:
            color *= texture(u_textures[3], v_uv);
            break;
        case 4:
            color *= texture(u_textures[4], v_uv);
            break;
        case 5:
            color *= texture(u_textures[5], v_uv);
            break;
        case 6:
            color *= texture(u_textures[6], v_uv);
            break;
        case 7:
            color *= texture(u_textures[7], v_uv);
            break;
        case 8:
            color *= texture(u_textures[8], v_uv);
            break;
        case 9:
            color *= texture(u_textures[9], v_uv);
            break;
        case 10:
            color *= texture(u_textures[10], v_uv);
            break;
        case 11:
            color *= texture(u_textures[11], v_uv);
            break;
        case 12:
            color *= texture(u_textures[12], v_uv);
            break;
        case 13:
            color *= texture(u_textures[13], v_uv);
            break;
        case 14:
            color *= texture(u_textures[14], v_uv);
            break;
        case 15:
            color *= texture(u_textures[15], v_uv);
            break;
        case 16:
            color *= texture(u_textures[16], v_uv);
            break;
        case 17:
            color *= texture(u_textures[17], v_uv);
            break;
        case 18:
            color *= texture(u_textures[18], v_uv);
            break;
        case 19:
            color *= texture(u_textures[19], v_uv);
            break;
        case 20:
            color *= texture(u_textures[20], v_uv);
            break;
        case 21:
            color *= texture(u_textures[21], v_uv);
            break;
        case 22:
            color *= texture(u_textures[22], v_uv);
            break;
        case 23:
            color *= texture(u_textures[23], v_uv);
            break;
        case 24:
            color *= texture(u_textures[24], v_uv);
            break;
        case 25:
            color *= texture(u_textures[25], v_uv);
            break;
        case 26:
            color *= texture(u_textures[26], v_uv);
            break;
        case 27:
            color *= texture(u_textures[27], v_uv);
            break;
        case 28:
            color *= texture(u_textures[28], v_uv);
            break;
        case 29:
            color *= texture(u_textures[29], v_uv);
            break;
        case 30:
            color *= texture(u_textures[30], v_uv);
            break;
        case 31:
            color *= texture(u_textures[31], v_uv);
            break;
    }
    frag_color = color;
}
#endif
