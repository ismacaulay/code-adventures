#pragma once
#include <array>

#include "toolkit/math/box.h"

namespace tk {

namespace voxel {
    struct VoxelOctreeNode
    {
        enum class NodeType
        {
            Internal,
            Leaf,
            Empty,
        };

        std::array<VoxelOctreeNode*, 8> children;
        NodeType node_type;
        math::Box local_aabb;
        math::Box world_aabb;

        VoxelOctreeNode()
        {
            for (size_t i = 0; i < 8; i++) {
                children[i] = nullptr;
            }
        }
        ~VoxelOctreeNode()
        {
            for (size_t i = 0; i < 8; i++) {
                if (children[i]) {
                    delete children[i];
                    children[i] = nullptr;
                }
            }
        }
    };

    struct VoxelOctree
    {
        VoxelOctreeNode* root;
        glm::vec3 origin;
        float voxel_size;

        ~VoxelOctree() { delete root; }
    };

    VoxelOctree* generate_voxel_octree(const std::vector<float>& vertices,
                                       const std::vector<uint32_t>& triangles,
                                       float voxel_size);

}
}
