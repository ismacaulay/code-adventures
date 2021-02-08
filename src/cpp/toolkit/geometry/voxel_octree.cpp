#include "voxel_octree.h"

#include "logger/log.h"

using namespace tk::voxel;

namespace tk {
namespace geometry {
    void traverse_node(VoxelOctreeNode* node, MeshGeometry* geometry)
    {
        CAT_LOG_DEBUG("type: {}", node->node_type);
        if (node->node_type == VoxelOctreeNode::NodeType::Empty) {
            return;
        }

        if (node->node_type == VoxelOctreeNode::NodeType::Leaf) {
            auto min = node->world_aabb.min;
            auto max = node->world_aabb.max;
            // clang-format off
            geometry->positions.insert(geometry->positions.end(), {
                min.x, min.y, min.z,
                max.x, min.y, min.z,
                max.x, max.y, min.z,
                min.x, max.y, min.z,

                max.x, max.y, max.z,
                max.x, max.y, max.z,
                max.x, max.y, max.z,
                max.x, max.y, max.z,
            });
            // clang-format on

            auto idx = geometry->indices.size();
            uint32_t idx_0 = idx + 0;
            uint32_t idx_1 = idx + 1;
            uint32_t idx_2 = idx + 2;
            uint32_t idx_3 = idx + 3;
            uint32_t idx_4 = idx + 4;
            uint32_t idx_5 = idx + 5;
            uint32_t idx_6 = idx + 6;
            uint32_t idx_7 = idx + 7;

            // clang-format off
            geometry->indices.insert(geometry->indices.end(), {
                // front
                idx_0, idx_1, idx_2,
                idx_2, idx_3, idx_0,

                // right
                idx_1, idx_5, idx_6,
                idx_6, idx_2, idx_1,

                // back
                idx_5, idx_4, idx_7,
                idx_7, idx_6, idx_5,

                // left
                idx_4, idx_0, idx_3,
                idx_3, idx_7, idx_4,

                // top
                idx_3, idx_2, idx_6,
                idx_6, idx_7, idx_3,

                // bottom
                idx_1, idx_0, idx_4,
                idx_4, idx_5, idx_1,
            });
            // clang-format on

            return;
        }

        // we are not empty or a leaf so lets recurse into the children
        for (auto i = 0; i < node->children.size(); ++i) {
            traverse_node(node->children[i], geometry);
        }
    }

    void traverse_tree(VoxelOctree* tree, MeshGeometry* geometry)
    {
        if (tree->root == nullptr) {
            return;
        }

        traverse_node(tree->root, geometry);
    }

    std::shared_ptr<MeshGeometry> from_voxel_octree(VoxelOctree* tree)
    {
        if (tree == nullptr) {
            return nullptr;
        }

        auto geometry = std::make_shared<MeshGeometry>();
        traverse_tree(tree, geometry.get());
        return geometry;
    }
}
}
