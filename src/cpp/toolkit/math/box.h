#pragma once

#include <array>
#include <vector>

#include <glm/glm.hpp>

namespace tk {
namespace math {
    struct Box
    {
        glm::vec3 min;
        glm::vec3 max;

        glm::vec3 centre() const
        {
            return glm::vec3(min.x + (width() * 0.5),
                             min.y + (height() * 0.5),
                             min.z + (depth() * 0.5));
        }

        float width() const { return max.x - min.x; }
        float height() const { return max.y - min.y; }
        float depth() const { return max.z - min.z; }

        std::array<glm::vec3, 8> corners() const
        {
            return {
                min,
                { max.x, min.y, min.z },
                { max.z, max.y, min.z },
                { min.x, max.y, min.z },
                { min.x, min.y, max.z },
                { max.x, min.y, max.z },
                max,
                { min.x, max.y, max.z },
            };
        }

        template <typename OStream>
        friend OStream& operator<<(OStream& os, const Box& box)
        {
            return os << "[box min=" << box.min << ", max=" << box.max << "]";
        }
    };

    Box compute_aabb(const std::vector<float>& vertices);
}
}
