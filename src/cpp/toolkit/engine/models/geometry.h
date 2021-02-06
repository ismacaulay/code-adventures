#pragma once

#include <cstdint>
#include <vector>

namespace tk {
namespace engine {

    struct MeshGeometry
    {
        std::vector<float> positions;
        std::vector<uint32_t> indices;
    };

}
}
