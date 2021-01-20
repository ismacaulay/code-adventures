#pragma once
#include <memory>
#include <vector>

namespace tk {
namespace engine {
    class Mesh;
    class Shader;

    class Model
    {
    public:
        explicit Model() = default;
        ~Model();

        void add_mesh(std::unique_ptr<Mesh> mesh);

        void render(const std::shared_ptr<Shader>& shader);

    private:
        std::vector<std::unique_ptr<Mesh>> meshes_;
    };

}
}
