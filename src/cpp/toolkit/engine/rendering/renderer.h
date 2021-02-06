#pragma once
#include <cstdint>
#include <memory>
#include <unordered_map>

#include <glm/glm.hpp>

#include "defines.h"

namespace tk {
namespace engine {

    class Camera;
    class Shader;
    class VertexArray;
    struct MeshGeometry;

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

        static void submit(const std::shared_ptr<Shader>& shader,
                           const std::shared_ptr<MeshGeometry>& geometry,
                           const glm::mat4& transform = glm::mat4(1.0f),
                           RenderMode mode = RenderMode::Triangles);

    private:
        struct SceneData
        {
            glm::mat4 view_projection;
            std::unordered_map<void*, std::shared_ptr<VertexArray>> va_map;
        };

        static std::unique_ptr<SceneData> data_;
    };

}
}
