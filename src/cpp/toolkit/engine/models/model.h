#pragma once
#include <glm/glm.hpp>
#include <memory>
#include <vector>

namespace tk {
namespace math {
    struct Box;
}

namespace engine {
    class Mesh;
    class Shader;

    class Model
    {
    public:
        explicit Model();
        ~Model();

        void add_mesh(std::unique_ptr<Mesh> mesh);

        void render(const std::shared_ptr<Shader>& shader,
                    const glm::mat4& transform = glm::mat4(1.0f));

    private:
        void update_bounding_box();

    private:
        std::vector<std::unique_ptr<Mesh>> meshes_;
        std::unique_ptr<math::Box> box_;
    };

}
}
