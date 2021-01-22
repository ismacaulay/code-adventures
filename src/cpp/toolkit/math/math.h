#pragma once
#include <glm/glm.hpp>

namespace tk {
namespace math {
    glm::vec3 apply_quat(const glm::vec3& v, const glm::quat& q);

    glm::vec3 to_spherical(const glm::vec3& v);
    glm::vec3 to_cartesian(const glm::vec3& s);
}
}
