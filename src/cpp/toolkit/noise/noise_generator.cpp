#include "noise_generator.h"

#include <FastNoise/FastNoiseLite.h>

namespace tk {
namespace noise {
    FastNoiseLite::NoiseType noiseTypeToFastNoiseType(NoiseType type)
    {
        switch (type) {
            case NoiseType::Perlin:
                return FastNoiseLite::NoiseType_Perlin;
        }

        return FastNoiseLite::NoiseType_Value;
    }

    float* generate_perlin_noise(size_t width, size_t height, float scale)
    {
        FastNoiseLite noise;
        noise.SetNoiseType(FastNoiseLite::NoiseType_OpenSimplex2);
        noise.SetSeed(1337);
        noise.SetFrequency(0.010);
        noise.SetFractalType(FastNoiseLite::FractalType_FBm);
        noise.SetFractalOctaves(5);
        noise.SetFractalLacunarity(2);
        noise.SetFractalGain(0.50);

        if (scale <= 0.0) {
            scale = 0.0001f;
        }

        float* data = new float[width * height];
        size_t idx = 0;
        for (size_t y = 0; y < height; ++y) {
            for (size_t x = 0; x < width; ++x) {
                float sample_x = x / scale;
                float sample_y = y / scale;

                // GetNoise returns values between -1 and 1
                float value = noise.GetNoise(sample_x, sample_y);
                data[idx++] = (value + 1.0) / 2.0;
            }
        }

        return data;
    }
}
}
