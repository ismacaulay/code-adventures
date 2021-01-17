#pragma once
#include <cstdint>
#include <glm/glm.hpp>
#include <memory>

#include "defines.h"

namespace tk {
namespace engine {

    class Camera;
    class Shader;
    class VertexArray;

    class Renderer
    {
    public:
        static void init();
        static void shutdown();

        static void resize(uint32_t width, uint32_t height);

        static void begin(const Camera& camera);
        static void end();

        static void submit_fill_mode(FillMode mode);

        static void submit(const std::shared_ptr<Shader>& shader,
                           const std::shared_ptr<VertexArray>& vertex_array,
                           const glm::mat4& transform = glm::mat4(1.0f),
                           RenderMode mode = RenderMode::Triangles);

    private:
        struct SceneData
        {
            glm::mat4 view_projection_;
        };

        static std::unique_ptr<SceneData> data_;
    };

}
}
