#include "box.h"

#include "defines.h"

namespace tk {
namespace math {

    Box compute_aabb(const std::vector<float>& vertices)
    {
        Box aabb;

        glm::vec3 min = { MAX_F32, MAX_F32, MAX_F32 };
        glm::vec3 max = { MIN_F32, MIN_F32, MIN_F32 };

        size_t num_verts = vertices.size() / 3;
        float x, y, z;
        for (size_t i = 0; i < num_verts; ++i) {
            x = vertices[i * 3 + 0];
            y = vertices[i * 3 + 1];
            z = vertices[i * 3 + 2];

            if (x < min.x) {
                min.x = x;
            }
            if (y < min.y) {
                min.y = y;
            }
            if (z < min.z) {
                min.z = z;
            }

            if (x > max.x) {
                max.x = x;
            }
            if (y > max.y) {
                max.y = y;
            }
            if (z > max.z) {
                max.z = z;
            }
        }

        aabb.min = min;
        aabb.max = max;

        return aabb;
    }

}
}
