#pragma once
#include <glm/glm.hpp>

namespace tk {
namespace engine {

    class Camera
    {
    public:
        virtual ~Camera() = default;

        virtual const glm::mat4& view() const = 0;
        virtual const glm::mat4& projection() const = 0;
        virtual const glm::mat4& view_projection() const = 0;
    };

}
}
