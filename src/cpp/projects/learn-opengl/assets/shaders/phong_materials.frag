#version 330 core
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
uniform Material u_material;

struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform Light u_light;

uniform vec3 u_color;
uniform vec3 u_view_pos;

in vec3 v_normal;
in vec3 v_frag_pos;

out vec4 frag_color;

void main()
{
    vec3 normal = normalize(v_normal);
    vec3 light_dir = normalize(u_light.position - v_frag_pos);
    vec3 view_dir = normalize(u_view_pos - v_frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    // ambient
    vec3 ambient = u_material.ambient * u_light.ambient;

    // diffuse
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = (diff * u_material.diffuse) * u_light.diffuse;

    // specular
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = (spec * u_material.specular) * u_light.specular;

    vec3 result = ambient + diffuse + specular;
    frag_color = vec4(result, 1.0);
}
