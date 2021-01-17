#version 330 core

#ifdef VERTEX_SHADER
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
#endif

#ifdef FRAGMENT_SHADER
struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
uniform Material u_material;

struct Light
{
    vec3 position;

    vec3 direction;
    float cutoff;
    float outer_cutoff;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};
uniform Light u_light;

uniform vec3 u_view_pos;

in vec3 v_normal;
in vec3 v_frag_pos;
in vec2 v_tex_coords;

out vec4 frag_color;

void main()
{
    vec3 normal = normalize(v_normal);
    vec3 light_dir = normalize(u_light.position - v_frag_pos);
    vec3 view_dir = normalize(u_view_pos - v_frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    float theta = dot(light_dir, normalize(-u_light.direction));
    float epsilon = u_light.cutoff - u_light.outer_cutoff;
    float intensity = clamp((theta - u_light.outer_cutoff) / epsilon, 0.0, 1.0);

    // ambient
    vec3 ambient =
        u_light.ambient * vec3(texture(u_material.diffuse, v_tex_coords));

    // diffuse
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * u_light.diffuse *
                   vec3(texture(u_material.diffuse, v_tex_coords));
    diffuse *= intensity;

    // specular
    float spec =
        pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = spec * u_light.specular *
                    vec3(texture(u_material.specular, v_tex_coords));
    specular *= intensity;

    // attenuation
    float light_dist = length(u_light.position - v_frag_pos);
    float attenuation =
        1.0 / (u_light.constant + (u_light.linear * light_dist) +
               (u_light.quadratic * light_dist * light_dist));

    vec3 result = attenuation * (ambient + specular + diffuse);
    frag_color = vec4(result, 1.0);
}
#endif
