#include <catch2/catch.hpp>

#include "noise/noise_generator.h"
#include "toolkit/noise.h"

TEST_CASE("can generate perlin noise", "[noise generator]")
{
    size_t width = 100;
    size_t height = 100;

    tk::noise::NoiseGenerator generator(width, height);
    generator.set_scale(0.3);
    float* noise = generator.generate();

    for (size_t y = 0; y < height; ++y) {
        for (size_t x = 0; x < width; ++x) {
            size_t idx = y * width + x;
            REQUIRE(noise[idx] >= 0.0);
            REQUIRE(noise[idx] <= 1.0);
        }
    }

    delete[] noise;
}
