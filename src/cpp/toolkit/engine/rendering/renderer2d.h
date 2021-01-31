#pragma once
#include <cstdint>
#include <glm/glm.hpp>
#include <memory>

#include "defines.h"

namespace tk {
namespace engine {

    class OrthographicCamera2D;
    class Shader;
    class VertexArray;
    class Texture2D;

    class Renderer2D
    {
    public:
        static void init();
        static void shutdown();

        static void resize(uint32_t width, uint32_t height);

        static void begin(const OrthographicCamera2D& camera);
        static void end();
        static void flush();

        static void draw_quad(const glm::mat4& transform,
                              const glm::vec4& color);
        static void draw_quad(const glm::mat4& transform,
                              const std::shared_ptr<Texture2D>& texture,
                              const glm::vec4& color = glm::vec4(1.0f));

    private:
        static void start_batch();
        static void next_batch();
    };

}
}
