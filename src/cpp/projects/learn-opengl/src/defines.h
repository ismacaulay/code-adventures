#pragma once
#include <glm/glm.hpp>

struct Material
{
    glm::vec3 ambient;
    glm::vec3 diffuse;
    glm::vec3 specular;
    float shininess;
};

const Material EMERALD = {
    { 0.0215, 0.1745, 0.0215 },
    { 0.07568, 0.61424, 0.07568 },
    { 0.633, 0.727811, 0.633 },
    0.6,
};

const Material GREEN_RUBBER = {
    { 0.0, 0.05, 0.0 },
    { 0.4, 0.5, 0.4 },
    { 0.04, 0.7, 0.04 },
    0.078125,
};

const Material SILVER = { { 0.19225, 0.19225, 0.19225 },
                          { 0.50754, 0.50754, 0.50754 },
                          { 0.508273, 0.508273, 0.508273 },
                          0.4 };
