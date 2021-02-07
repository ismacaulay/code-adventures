#include "voxelization.h"

#include "toolkit/math/intersection.h"

namespace tk {
namespace voxel {

    void subdivide(VoxelOctree* octree,
                   VoxelOctreeNode* node,
                   const std::vector<float>& vertices,
                   const std::vector<size_t>& triangles)

    {
        // get the half width of the parent AABB
        auto width = (node->local_aabb.max.x - node->local_aabb.min.x) / 2;

        // create the children for this node
        size_t child_idx = 0;
        for (size_t z = 0; z < 2; z++) {
            for (size_t y = 0; y < 2; y++) {
                for (size_t x = 0; x < 2; x++) {
                    VoxelOctreeNode* child = new VoxelOctreeNode;
                    child->local_aabb.min =
                        node->local_aabb.min +
                        glm::vec3(width * x, width * y, width * z);
                    child->local_aabb.max =
                        child->local_aabb.min + glm::vec3(width);
                    child->world_aabb.min =
                        octree->origin +
                        (child->local_aabb.min * octree->voxel_size);
                    child->world_aabb.max =
                        octree->origin +
                        (child->local_aabb.max * octree->voxel_size);

                    node->children[child_idx++] = child;
                }
            }
        }

        std::vector<size_t> child_triangle_list;
        std::array<glm::vec3, 3> triangle_verts;
        for (size_t i = 0; i < 8; ++i) {
            child_triangle_list.clear();
            auto* child = node->children[i];

            // build the triangle list that the child world aabb intersects with
            for (size_t t = 0; t < triangles.size(); ++t) {
                size_t t1 = triangles[t * 3 + 0];
                size_t t2 = triangles[t * 3 + 1];
                size_t t3 = triangles[t * 3 + 2];

                triangle_verts[0].x = vertices[t1 * 3 + 0];
                triangle_verts[0].y = vertices[t1 * 3 + 1];
                triangle_verts[0].z = vertices[t1 * 3 + 2];

                triangle_verts[1].x = vertices[t2 * 3 + 0];
                triangle_verts[1].y = vertices[t2 * 3 + 1];
                triangle_verts[1].z = vertices[t2 * 3 + 2];

                triangle_verts[2].x = vertices[t3 * 3 + 0];
                triangle_verts[2].y = vertices[t3 * 3 + 1];
                triangle_verts[2].z = vertices[t3 * 3 + 2];

                if (math::aabb_triangle_intersection(child->world_aabb,
                                                     triangle_verts)) {
                    child_triangle_list.push_back(t);
                }
            }

            // if we have an empty triangle list, there were no intersections so
            // we go no further. if there are intersections, if our local aabb
            // width is 1, we are at the minimum size that we want so we are at
            // a leaf node otherwise we subdivide the child with the triangle
            // list that it intersects with
            if (child_triangle_list.empty()) {
                child->node_type = VoxelOctreeNode::NodeType::Empty;
            } else {
                if (width == 1) {
                    child->node_type = VoxelOctreeNode::NodeType::Leaf;
                } else {
                    child->node_type = VoxelOctreeNode::NodeType::Internal;
                    subdivide(octree, node, vertices, child_triangle_list);
                }
            }
        }
    }

    VoxelOctree* generate_voxel_octree(const std::vector<float>& vertices,
                                       uint32_t resolution)
    {

        std::vector<size_t> triangle_list;
        for (size_t i = 0; i < vertices.size(); i += 3) {
            triangle_list.push_back(i);
        }

        return nullptr;
    }

}
}
