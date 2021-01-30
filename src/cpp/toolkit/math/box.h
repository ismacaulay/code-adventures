#pragma once

#include <array>
#include <glm/glm.hpp>

namespace tk {
namespace math {
    struct Box
    {
        glm::vec3 min;
        glm::vec3 max;

        glm::vec3 centre()
        {
            return glm::vec3(min.x + ((max.x - min.x) / 2.0f),
                             min.y + ((max.y - min.y) / 2.0f),
                             min.z + ((max.z - min.z) / 2.0f));
        }

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
    };

}
}
