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

const float offset = 1.0 / 300.0;

void main()
{
    // frag_color = texture(u_screen_tex, v_uv);

    // inversion
    // frag_color = vec4(vec3(1.0 - texture(u_screen_tex, v_uv)), 1.0);

    // grayscale
    // vec4 color = texture(u_screen_tex, v_uv);
    // float average = (color.r + color.g + color.b) / 3.0;
    // float average = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    // frag_color = vec4(average, average, average, 1.0);

    // clang-format off
    vec2 offsets[9] = vec2[](
        vec2(-offset,  offset), // top-left
        vec2( 0.0f,    offset), // top-center
        vec2( offset,  offset), // top-right
        vec2(-offset,  0.0f),   // center-left
        vec2( 0.0f,    0.0f),   // center-center
        vec2( offset,  0.0f),   // center-right
        vec2(-offset, -offset), // bottom-left
        vec2( 0.0f,   -offset), // bottom-center
        vec2( offset, -offset)  // bottom-right
    );

    // sharpen
    // float kernel[9] = float[](
    //     -1, -1, -1,
    //     -1,  9, -1,
    //     -1, -1, -1
    // );

    // blur
    // float kernel[9] = float[](
    //     1.0 / 16, 2.0 / 16, 1.0 / 16,
    //     2.0 / 16, 4.0 / 16, 2.0 / 16,
    //     1.0 / 16, 2.0 / 16, 1.0 / 16
    // );

    // edge detection
    float kernel[9] = float[](
        1,  1, 1,
        1, -8, 1,
        1,  1, 1
    );

    // clang-format on

    vec3 sample_tex[9];
    for (int i = 0; i < 9; i++) {
        sample_tex[i] = vec3(texture(u_screen_tex, v_uv.st + offsets[i]));
    }
    vec3 col = vec3(0.0);
    for (int i = 0; i < 9; i++)
        col += sample_tex[i] * kernel[i];

    frag_color = vec4(col, 1.0);
}
#endif
