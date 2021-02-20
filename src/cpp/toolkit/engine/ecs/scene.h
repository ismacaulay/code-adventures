#pragma once

#include <entt/entt.hpp>

#include "entity.h"

namespace tk {
namespace engine {
    class Shader;

    class Scene
    {
    public:
        explicit Scene();
        ~Scene();

        Entity create_entity(const std::string& name = "Entity");

        void update(float delta);

    private:
        void add_lights_to_shader(std::shared_ptr<Shader>& shader);

    private:
        entt::registry registry_;

        friend class SceneHeirarchyPanel;
    };

}
}
