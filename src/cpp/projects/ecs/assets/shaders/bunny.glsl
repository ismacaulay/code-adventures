#version 330 core

#ifdef VERTEX_SHADER
layout(location = 0) in vec3 a_position;

uniform mat4 u_view_projection;
uniform mat4 u_model_view;
uniform mat4 u_model;

out vec3 v_position_eye;
out vec3 v_frag_pos;

void main()
{
    v_frag_pos = vec3(u_model * vec4(a_position, 1.0));
    v_position_eye = vec3(u_model_view * vec4(a_position, 1.0));

    gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER

in vec3 v_position_eye;
in vec3 v_frag_pos;

uniform vec3 u_view_pos;

struct Light
{
    vec3 position;
    vec3 color;
};

uniform Light u_light;

out vec4 frag_color;

void main()
{
    vec3 normal = normalize(
        cross(dFdx(v_position_eye), dFdy(v_position_eye)));
    vec3 light_dir = normalize(u_light.position - v_frag_pos);
    vec3 view_dir = normalize(u_view_pos - v_frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    float ambient_strength = 0.1;
    vec3 ambient = ambient_strength * u_light.color;

    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * u_light.color;

    float specular_strength = 0.5;
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32);
    vec3 specular = specular_strength * spec * u_light.color;

    vec3 color = vec3(0.7, 0.3, 0.2);
    vec3 result = (ambient + diffuse + specular) * color;

    frag_color = vec4(result, 1.0);
}
#endif
