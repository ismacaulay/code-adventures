#include "intersection.h"

namespace tk {
namespace math {
    bool aabb_plane_intersection(const Box& aabb,
                                 const glm::vec3& n,
                                 const glm::vec3& p)
    {
        auto extents = glm::vec3(
            aabb.width() * 0.5, aabb.height() * 0.5, aabb.depth() * 0.5);

        float r = extents.x * std::abs(n.x) + extents.y * std::abs(n.y) +
                  extents.z * std::abs(n.z);

        float d = glm::dot(n, p);
        float s = glm::dot(n, aabb.centre()) - d;

        return std::abs(s) <= r;
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

        // TODO: Does the order of the tests matter for performance?

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
        glm::vec3 f0 = v1 - v0;
        glm::vec3 f1 = v2 - v1;
        glm::vec3 f2 = v0 - v2;

        float p0, p1, p2;
        float r;
        glm::vec3 abs_f0 = glm::abs(f0);
        glm::vec3 abs_f1 = glm::abs(f1);
        glm::vec3 abs_f2 = glm::abs(f2);

        // check e0 = (1, 0, 0) x f{0, 1, 2}
        // a = e x f = (0, -fz, fy)
        // p0 and p1 are equal
        p0 = -f0.z * v0.y + f0.y * v0.z;
        p2 = -f0.z * v2.y + f0.y * v2.z;
        r = h.y * abs_f0.z + h.z * abs_f0.y;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p1 and p2 are equal
        p0 = -f1.z * v0.y + f1.y * v0.z;
        p2 = -f1.z * v2.y + f1.y * v2.z;
        r = h.y * abs_f1.z + h.z * abs_f1.y;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p0 and p2 are equal
        p0 = -f2.z * v0.y + f2.y * v0.z;
        p1 = -f2.z * v1.y + f2.y * v1.z;
        r = h.y * abs_f2.z + h.z * abs_f2.y;
        if (std::min(p0, p1) > r || std::max(p0, p1) < -r) {
            return false;
        }

        // check e1 = (0, 1, 0) x f{0, 1, 2}
        // a = e x f = (fz, 0, -fx)
        // p0 and p1 are equal
        p0 = f0.z * v0.x - f0.x * v0.z;
        p2 = f0.z * v2.x - f0.x * v2.z;
        r = h.x * abs_f0.z + h.z * abs_f0.x;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p1 and p2 are equal
        p0 = f1.z * v0.x - f1.x * v0.z;
        p2 = f1.z * v2.x - f1.x * v2.z;
        r = h.x * abs_f1.z + h.z * abs_f1.x;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p0 and p2 are equal
        p0 = f2.z * v0.x - f2.x * v0.z;
        p1 = f2.z * v1.x - f2.x * v1.z;
        r = h.x * abs_f2.z + h.z * abs_f2.x;
        if (std::min(p0, p1) > r || std::max(p0, p1) < -r) {
            return false;
        }

        // check e2 = (0, 0, 1) x f{0, 1, 2}
        // a = (-fy, fx, 0)
        // p0 and p1 are equal
        p0 = -f0.y * v0.x + f0.x * v0.y;
        p2 = -f0.y * v2.x + f0.x * v2.y;
        r = h.x * abs_f0.y + h.y * abs_f0.x;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p1 and p2 are equal
        p0 = -f1.y * v0.x + f1.x * v0.y;
        p2 = -f1.y * v2.x + f1.x * v2.y;
        r = h.x * abs_f1.y + h.y * abs_f1.x;
        if (std::min(p0, p2) > r || std::max(p0, p2) < -r) {
            return false;
        }
        // p0 and p2 are equal
        p0 = -f2.y * v0.x + f2.x * v0.y;
        p1 = -f2.y * v1.x + f2.x * v1.y;
        r = h.x * abs_f2.y + h.y * abs_f2.x;
        if (std::min(p0, p1) > r || std::max(p0, p1) < -r) {
            return false;
        }

        // if we make it to the end then the triangle overlaps the aabb
        return true;
    }
}
}
