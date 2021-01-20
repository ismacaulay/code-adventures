#pragma once

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
    };

}
}
