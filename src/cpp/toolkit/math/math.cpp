#include "math.h"

#include <algorithm>

#include <glm/gtc/quaternion.hpp>

namespace tk {
namespace math {
    glm::vec3 apply_quat(const glm::vec3& v, const glm::quat& q)
    {
        return (q * v) * glm::inverse(q);
    }

    glm::vec3 to_spherical(const glm::vec3& v)
    {
        double r = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        // double t = atan2(v.x, v.z);
        // double p = atan2(sqrt(v.x * v.x + v.z * v.z), v.y);
        double t = 0.0;
        double p = 0.0;
        if (r != 0.0) {
            t = atan2(v.x, v.z);
            p = acos(std::clamp(v.y / r, -1.0, 1.0));
        }
        return glm::vec3(r, t, p);
    }

    glm::vec3 to_cartesian(const glm::vec3& s)
    {
        double r = s.x;
        double t = s.y;
        double p = s.z;
        double sin_p = sin(p);

        double x = r * sin_p * sin(t);
        double y = r * cos(p);
        double z = r * sin_p * cos(t);

        return glm::vec3(x, y, z);
    }

}
}
