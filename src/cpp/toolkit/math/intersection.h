#pragma once

#include <glm/glm.hpp>

#include "box.h"

namespace tk {
namespace math {

    bool aabb_triangle_intersection(const Box& aabb,
                                    const std::array<glm::vec3, 3>& triangle);

}
}
