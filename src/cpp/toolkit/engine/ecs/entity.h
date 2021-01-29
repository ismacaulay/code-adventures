#pragma once

#include <entt/entt.hpp>

#include "logger/assert.h"

namespace tk {
namespace engine {

    class Entity
    {
    public:
        Entity()
            : entity_(entt::null)
            , registry_(nullptr)
        {}
        Entity(entt::entity entity, entt::registry* registry)
            : entity_(entity)
            , registry_(registry)
        {}
        Entity(const Entity& other)
            : entity_(other.entity_)
            , registry_(other.registry_)
        {}

        template <typename T, typename... Args>
        T& add_component(Args&&... args)
        {
            CAT_ASSERT(!registry_->has<T>(entity_));

            return registry_->emplace<T>(entity_, std::forward<Args>(args)...);
        }

        template <typename T>
        T& get_component()
        {
            CAT_ASSERT(registry_->has<T>(entity_));

            return registry_->get<T>(entity_);
        }

    private:
        entt::entity entity_;
        entt::registry* registry_;
    };

}
}
