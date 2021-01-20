#pragma once
#include <memory>
#include <string>

namespace tk {
namespace engine {
    class Model;

    class ModelLoader
    {
    public:
        static std::unique_ptr<Model> load(const std::string& path);

    private:
        ModelLoader() = default;
        ~ModelLoader() = default;
    };

}
}
