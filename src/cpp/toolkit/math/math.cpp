#include "math.h"

#include <algorithm>

#include <glm/gtc/quaternion.hpp>

namespace tk {
namespace math {
    glm::vec3 apply_quat(const glm::vec3& v, const glm::quat& q)
    {
        return (q * v) * glm::inverse(q);
    }

    Spherical to_spherical(const glm::vec3& v)
    {
        float r = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        // double t = atan2(v.x, v.z);
        // double p = atan2(sqrt(v.x * v.x + v.z * v.z), v.y);
        float t = 0.0;
        float p = 0.0;
        if (r != 0.0) {
            t = atan2(v.x, v.z);
            p = acos(std::clamp(v.y / r, -1.0f, 1.0f));
        }
        return Spherical{ r, t, p };
    }

    glm::vec3 to_cartesian(const Spherical& s)
    {
        float sin_p = sin(s.phi);
        float x = s.r * sin_p * sin(s.theta);
        float y = s.r * cos(s.phi);
        float z = s.r * sin_p * cos(s.theta);

        return glm::vec3(x, y, z);
    }

}
}
