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

        Entity create_entity();

        void update(float delta);

    private:
        entt::registry registry_;
    };
}
}
