#pragma once
#include "geometry.h"
#include "toolkit/voxel/voxelization.h"

namespace tk {
namespace geometry {
    std::shared_ptr<MeshGeometry> from_voxel_octree(voxel::VoxelOctree* octree);
}
}
