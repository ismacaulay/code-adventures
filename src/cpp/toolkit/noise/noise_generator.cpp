#include "noise_generator.h"

#include <algorithm>

#include <FastNoise/FastNoiseLite.h>

#include "defines.h"
#include "toolkit/math/math.h"

namespace tk {
namespace noise {
    NoiseGenerator::NoiseGenerator(size_t width, size_t height)
        : width_(width)
        , height_(height)
    {}

    float* NoiseGenerator::generate()
    {
        FastNoiseLite noise;
        noise.SetNoiseType(FastNoiseLite::NoiseType_Perlin);
        noise.SetFractalType(FastNoiseLite::FractalType_FBm);

        noise.SetFrequency(1);
        noise.SetFractalOctaves(octaves_);
        noise.SetFractalLacunarity(lacunarity_);
        noise.SetFractalGain(persistance_);

        if (scale_ <= 0.0) {
            scale_ = 0.0001f;
        }

        float* data = new float[width_ * height_];
        size_t idx = 0;
        float min = MAX_F32;
        float max = MIN_F32;

        float half_width = width_ / 2.0f;
        float half_height = height_ / 2.0f;
        for (size_t y = 0; y < height_; ++y) {
            for (size_t x = 0; x < width_; ++x) {
                float sample_x = (x - half_width) / scale_;
                float sample_y = (y - half_height) / scale_;

                float value = noise.GetNoise(sample_x, sample_y);
                min = std::min(min, value);
                max = std::max(max, value);
                data[idx++] = value;
            }
        }

        for (size_t i = 0; i < width_ * height_; ++i) {
            data[i] = math::inverse_lerp(min, max, data[i]);
        }
        return data;
    }
}
}
