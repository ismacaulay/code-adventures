#pragma once
#include <glm/glm.hpp>

namespace tk {
namespace math {
    glm::vec3 apply_quat(const glm::vec3& v, const glm::quat& q);

    struct Spherical
    {
        float r;
        float theta;
        float phi;
    };

    Spherical to_spherical(const glm::vec3& v);
    glm::vec3 to_cartesian(const Spherical& s);

    template <typename T>
    T inverse_lerp(T min, T max, T value)
    {
        return (value - min) / (max - min);
    }
}
}
