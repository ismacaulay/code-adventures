#pragma once

#include "toolkit/engine/models/model.h"
#include "toolkit/engine/rendering/defines.h"
#include "toolkit/engine/rendering/shader.h"

namespace tk {
namespace engine {

    struct TagComponent
    {
        std::string tag;

        TagComponent() = default;
        TagComponent(const std::string& tag)
            : tag(tag)
        {}
        TagComponent(const TagComponent& other)
            : tag(other.tag)
        {}
    };

    struct TransformComponent
    {
        glm::mat4 transform;

        TransformComponent()
            : transform(1.0f)
        {}
        TransformComponent(const TransformComponent&) = default;

        glm::mat4& operator()() { return transform; }
        const glm::mat4& operator()() const { return transform; }
    };

    struct ModelRendererComponent
    {
        std::shared_ptr<Model> model;
        std::shared_ptr<Shader> shader;
        FillMode fill_mode;

        ModelRendererComponent() = default;
        ModelRendererComponent(const ModelRendererComponent&) = default;
    };

}
}
