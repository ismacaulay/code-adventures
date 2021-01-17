#version 330 core

uniform vec3 u_color;
uniform vec3 u_light_color;

out vec4 color;

void main()
{
    color = vec4(u_light_color * u_color, 1.0f);
}
