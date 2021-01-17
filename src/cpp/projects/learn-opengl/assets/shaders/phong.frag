#version 330 core
uniform vec3 u_color;
uniform vec3 u_light_color;
uniform vec3 u_light_pos;
uniform vec3 u_view_pos;

in vec3 v_normal;
in vec3 v_frag_pos;

out vec4 frag_color;

void main()
{
    vec3 normal = normalize(v_normal);
    vec3 light_dir = normalize(u_light_pos - v_frag_pos);
    vec3 view_dir = normalize(u_view_pos - v_frag_pos);
    vec3 reflect_dir = reflect(-light_dir, normal);

    float ambient_strength = 0.1;
    vec3 ambient = ambient_strength * u_light_color;

    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * u_light_color;

    float specular_strength = 0.5;
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32);
    vec3 specular = specular_strength * spec * u_light_color;

    vec3 result = (ambient + diffuse + specular) * u_color;
    frag_color = vec4(result, 1.0);
}
