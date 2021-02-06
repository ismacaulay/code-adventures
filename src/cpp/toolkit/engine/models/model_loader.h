#pragma once
#include <memory>
#include <string>

namespace tk {
namespace engine {
    class Model;
    struct MeshGeometry;

    class ModelLoader
    {
    public:
        static std::unique_ptr<Model> load(const std::string& path);
        static std::unique_ptr<MeshGeometry> load_mesh_geometry(
            const std::string& path);

    private:
        ModelLoader() = default;
        ~ModelLoader() = default;
    };

}
}
