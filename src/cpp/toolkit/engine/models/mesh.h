#pragma once
#include <memory>
#include <vector>

#include <glm/glm.hpp>

namespace tk {
namespace math {
    struct Box;
}

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
        ~Mesh();

        void render(const std::shared_ptr<Shader>& shader,
                    const glm::mat4& transform = glm::mat4(1.0f));

        math::Box* compute_bounding_box();

    private:
        std::vector<Vertex> vertices_;
        std::vector<Index> indices_;
        std::vector<std::shared_ptr<Texture2D>> textures_;

        std::shared_ptr<VertexArray> va_;

        std::unique_ptr<math::Box> box_;
    };
}
}
