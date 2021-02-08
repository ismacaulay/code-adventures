#include <catch2/catch.hpp>

#include "toolkit/logger.h"
#include <glm/glm.hpp>

TEST_CASE("abs", "[glm]")
{
    glm::vec3 expected = { 1.0f, 2.0f, 3.0f };
    REQUIRE(glm::abs(glm::vec3(-1.0f, 2.0f, 3.0f)) == expected);
    REQUIRE(glm::abs(glm::vec3(1.0f, -2.0f, -3.0f)) == expected);
    REQUIRE(glm::abs(glm::vec3(1.0f, -2.0f, 3.0f)) == expected);
}
