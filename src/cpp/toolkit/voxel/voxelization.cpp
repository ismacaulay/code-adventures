#include "voxelization.h"

#include "toolkit/math/intersection.h"

namespace tk {
namespace voxel {

    uint32_t next_power_of_two(uint32_t value)
    {
        uint32_t v = value;

        v--;
        v |= v >> 1;
        v |= v >> 2;
        v |= v >> 4;
        v |= v >> 8;
        v |= v >> 16;
        v++;
        return v;
    }

    void subdivide(VoxelOctree* octree,
                   VoxelOctreeNode* node,
                   const std::vector<float>& vertices,
                   const std::vector<uint32_t>& triangles)

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

        std::vector<uint32_t> child_triangle_list;
        std::array<glm::vec3, 3> triangle_verts;
        for (size_t i = 0; i < 8; ++i) {
            child_triangle_list.clear();
            auto* child = node->children[i];

            // build the triangle list that the child world aabb intersects with
            for (uint32_t t = 0; t < triangles.size() / 3; ++t) {
                auto t1 = triangles[t * 3 + 0];
                auto t2 = triangles[t * 3 + 1];
                auto t3 = triangles[t * 3 + 2];

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
                    child_triangle_list.push_back(t1);
                    child_triangle_list.push_back(t2);
                    child_triangle_list.push_back(t3);
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
                                       const std::vector<uint32_t>& triangles,
                                       float voxel_size)
    {
        VoxelOctree* tree = new VoxelOctree;
        tree->root = new VoxelOctreeNode;
        tree->voxel_size = voxel_size;

        auto mesh_aabb = math::compute_aabb(vertices);

        float inverse_voxel_size = 1.0f / voxel_size;
        math::Box aabb = mesh_aabb;
        aabb.min *= inverse_voxel_size;
        aabb.max *= inverse_voxel_size;

        // find the longest axis
        auto dim = glm::abs(aabb.max - aabb.min);
        float max = std::max(std::max(dim.x, dim.y), dim.z);
        float power_of_two_dim =
            static_cast<float>(next_power_of_two(static_cast<uint32_t>(max)));

        // create the world/local aabb
        float world_size = power_of_two_dim * voxel_size;
        tree->origin = mesh_aabb.centre() - glm::vec3(world_size / 2.0f);
        tree->root->world_aabb.min = tree->origin;
        tree->root->world_aabb.max = tree->origin + glm::vec3(world_size);
        tree->root->local_aabb.min = glm::vec3(0);
        tree->root->local_aabb.max = glm::vec3(power_of_two_dim);

        subdivide(tree, tree->root, vertices, triangles);

        return tree;
    }

}
}
