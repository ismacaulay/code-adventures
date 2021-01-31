#pragma once

#include <cstdlib>

namespace tk {
namespace noise {

    enum class NoiseType
    {
        Perlin,
    };

    float* generate_perlin_noise(size_t width, size_t height, float scale);
}
}
