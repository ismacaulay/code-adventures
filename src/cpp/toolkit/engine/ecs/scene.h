#pragma once

#include <entt/entt.hpp>

#include "entity.h"

namespace tk {
namespace engine {

    class Scene
    {
    public:
        explicit Scene();
        ~Scene();

        Entity create_entity(const std::string& name = "Entity");

        void update(float delta);

    private:
        entt::registry registry_;

        friend class SceneHeirarchyPanel;
    };

}
}
