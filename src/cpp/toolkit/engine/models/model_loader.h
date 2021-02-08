#pragma once
#include <memory>
#include <string>

namespace tk {
namespace geometry {
    struct MeshGeometry;
}

namespace engine {
    class Model;

    class ModelLoader
    {
    public:
        static std::unique_ptr<Model> load(const std::string& path);
        static std::shared_ptr<geometry::MeshGeometry> load_mesh_geometry(
            const std::string& path);

    private:
        ModelLoader() = default;
        ~ModelLoader() = default;
    };

}
}
