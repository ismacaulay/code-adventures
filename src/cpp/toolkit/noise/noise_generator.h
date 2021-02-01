#pragma once

#include <cstdlib>

namespace tk {
namespace noise {

    class NoiseGenerator
    {
    public:
        NoiseGenerator(size_t width, size_t height);
        ~NoiseGenerator() = default;

        float* generate();

        size_t width() const { return width_; }
        size_t height() const { return height_; }

        float scale() const { return scale_; };
        void set_scale(float scale) { scale_ = scale; }

        int octaves() const { return octaves_; }
        void set_octaves(int octaves) { octaves_ = octaves; }

        float lacunarity() const { return lacunarity_; }
        void set_lacunarity(float lacunarity) { lacunarity_ = lacunarity; }

        float persistance() const { return persistance_; }
        void set_persistance(float persistance) { persistance_ = persistance; }

    private:
        size_t width_, height_;
        float scale_ = 25.2;
        int octaves_ = 4;
        float lacunarity_ = 2.0;
        float persistance_ = 0.5;
    };
}
}
