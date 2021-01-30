#pragma once

namespace tk {
namespace engine {
    class Scene;

    class SceneHeirarchyPanel
    {
    public:
        explicit SceneHeirarchyPanel(Scene& scene);
        ~SceneHeirarchyPanel() = default;

        void render();

    private:
        Scene& scene_;
    };
}
}
