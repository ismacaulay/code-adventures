#include <catch2/catch.hpp>

#include "toolkit/noise.h"

TEST_CASE("can generate perlin noise", "[noise generator]")
{
    size_t width = 100;
    size_t height = 100;
    float* noise =
        tk::noise::generate_perlin_noise(width, height, 0.3);

    for (size_t y = 0; y < height; ++y) {
        for (size_t x = 0; x < width; ++x) {
            size_t idx = y * width + x;
            REQUIRE(noise[idx] >= 0.0);
            REQUIRE(noise[idx] <= 1.0);
        }
    }

    delete[] noise;
}
