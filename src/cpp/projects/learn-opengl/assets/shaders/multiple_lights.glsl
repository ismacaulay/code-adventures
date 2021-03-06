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

struct DirLight
{
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform DirLight u_dir_light;

struct PointLight
{
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
#define NUM_POINT_LIGHTS 4
uniform PointLight u_point_lights[NUM_POINT_LIGHTS];

struct SpotLight
{
    vec3 position;
    vec3 direction;

    float cutoff;
    float outer_cutoff;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform SpotLight u_spot_light;

uniform vec3 u_view_pos;

in vec3 v_normal;
in vec3 v_frag_pos;
in vec2 v_tex_coords;

out vec4 frag_color;

vec3 calc_dir_light(DirLight light, vec3 normal, vec3 view_dir)
{
    vec3 light_dir = normalize(-light.direction);
    vec3 reflect_dir = reflect(-light_dir, normal);

    // ambient
    vec3 ambient =
        light.ambient * vec3(texture(u_material.diffuse, v_tex_coords));

    // diffuse
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse =
        diff * light.diffuse * vec3(texture(u_material.diffuse, v_tex_coords));

    // specular
    float spec =
        pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = spec * light.specular *
                    vec3(texture(u_material.specular, v_tex_coords));

    return (ambient + diffuse + specular);
}

vec3 calc_point_light(PointLight light,
                      vec3 normal,
                      vec3 frag_pos,
                      vec3 view_dir)
{
    vec3 light_dir = normalize(light.position - frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    // ambient
    vec3 ambient =
        light.ambient * vec3(texture(u_material.diffuse, v_tex_coords));

    // diffuse
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse =
        diff * light.diffuse * vec3(texture(u_material.diffuse, v_tex_coords));

    // specular
    float spec =
        pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = spec * light.specular *
                    vec3(texture(u_material.specular, v_tex_coords));

    // attenuation
    float light_dist = length(light.position - frag_pos);
    float attenuation = 1.0 / (light.constant + (light.linear * light_dist) +
                               (light.quadratic * light_dist * light_dist));

    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

vec3 calc_spot_light(SpotLight light, vec3 normal, vec3 frag_pos, vec3 view_dir)
{
    vec3 light_dir = normalize(light.position - frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    float theta = dot(light_dir, normalize(-light.direction));
    float epsilon = light.cutoff - light.outer_cutoff;
    float intensity = clamp((theta - light.outer_cutoff) / epsilon, 0.0, 1.0);

    // ambient
    vec3 ambient =
        light.ambient * vec3(texture(u_material.diffuse, v_tex_coords));

    // diffuse
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse =
        diff * light.diffuse * vec3(texture(u_material.diffuse, v_tex_coords));

    // specular
    float spec =
        pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = spec * light.specular *
                    vec3(texture(u_material.specular, v_tex_coords));

    // attenuation
    float light_dist = length(light.position - frag_pos);
    float attenuation = 1.0 / (light.constant + (light.linear * light_dist) +
                               (light.quadratic * light_dist * light_dist));

    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;

    return (ambient + diffuse + specular);
}

void main()
{
    vec3 normal = normalize(v_normal);
    vec3 view_dir = normalize(u_view_pos - v_frag_pos);

    vec3 result = calc_dir_light(u_dir_light, normal, view_dir);

    for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
        result +=
            calc_point_light(u_point_lights[i], normal, v_frag_pos, view_dir);
    }

    result += calc_spot_light(u_spot_light, normal, v_frag_pos, view_dir);
    frag_color = vec4(result, 1.0);
}
#endif
