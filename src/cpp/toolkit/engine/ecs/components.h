#pragma once

#include "engine/models/model.h"
#include "engine/rendering/defines.h"
#include "engine/rendering/shader.h"
#include "geometry/geometry.h"

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

    struct MeshRendererComponent
    {
        std::shared_ptr<geometry::MeshGeometry> geometry;
        std::shared_ptr<Shader> shader;
        FillMode fill_mode;

        MeshRendererComponent() = default;
        MeshRendererComponent(const MeshRendererComponent&) = default;
    };

}
}
