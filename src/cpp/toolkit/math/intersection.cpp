#include "intersection.h"

namespace tk {
namespace math {
    bool aabb_plane_intersection(const Box& aabb,
                                 const glm::vec3& n,
                                 const glm::vec3& p)
    {
        return false;
    }

    bool aabb_triangle_intersection(const Box& aabb,
                                    const std::array<glm::vec3, 3>& vertices)
    {
        auto centre = aabb.centre();
        auto h = glm::vec3(
            aabb.width() * 0.5, aabb.height() * 0.5, aabb.depth() * 0.5);

        glm::vec3 v0 = vertices[0] - centre;
        glm::vec3 v1 = vertices[1] - centre;
        glm::vec3 v2 = vertices[2] - centre;

        // check to see if the triangle aabb and given aabb intersect
        // passing this does not mean that the triangle is actually in the aabb,
        // just that its close
        //
        // TODO: it may be more performant to unroll the look finding the
        // min/max since its small
        auto triangle_aabb = compute_aabb(
            { v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z });
        if (triangle_aabb.min.x > h.x || triangle_aabb.max.x < -h.x)
            return false;
        if (triangle_aabb.min.y > h.y || triangle_aabb.max.y < -h.y)
            return false;
        if (triangle_aabb.min.z > h.z || triangle_aabb.max.z < -h.z)
            return false;

        // check to see if the normal plane of the triangle intersects the aabb
        // if it does not then the triangle is not part of the aabb even though
        // the two aabb's overlapped
        auto n = glm::cross(v0, v1);
        if (!aabb_plane_intersection(aabb, n, v1)) {
            return false;
        }

        // finally test the nine edge cross products

        // if we make it to the end then the triangle overlaps the aabb
        return true;
    }

}
}
