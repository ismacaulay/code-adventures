#pragma once
#include <memory>
#include <vector>

#include <glm/glm.hpp>

namespace tk {
namespace engine {
    class Shader;
    class VertexArray;
    class Texture2D;

    struct Vertex
    {
        glm::vec3 position;
        glm::vec3 normal;
        glm::vec2 tex_coords;
    };

    struct Index
    {
        uint32_t v1, v2, v3;
    };

    class Mesh
    {
    public:
        explicit Mesh(const std::vector<Vertex>& vertices,
                      const std::vector<Index>& indices,
                      const std::vector<std::shared_ptr<Texture2D>>& textures);
        ~Mesh() = default;

        void render(const std::shared_ptr<Shader>& shader);

    private:
        std::vector<Vertex> vertices_;
        std::vector<Index> indices_;
        std::vector<std::shared_ptr<Texture2D>> textures_;

        std::shared_ptr<VertexArray> va_;
    };
}
}
