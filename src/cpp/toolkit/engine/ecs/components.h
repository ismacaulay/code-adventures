#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtx/quaternion.hpp>

#include "toolkit/engine/models/geometry.h"
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
        glm::vec3 translation;
        glm::vec3 rotation;
        glm::vec3 scale;

        TransformComponent()
            : translation(0.0f)
            , rotation(0.0f)
            , scale(1.0f)
        {}
        TransformComponent(const TransformComponent&) = default;

        glm::mat4 transform()
        {
            glm::mat4 r = glm::toMat4(glm::quat(rotation));
            return glm::translate(glm::mat4(1.0f), translation) * r *
                   glm::scale(glm::mat4(1.0f), scale);
        }
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
        std::shared_ptr<MeshGeometry> geometry;
        std::shared_ptr<Shader> shader;
        FillMode fill_mode;

        MeshRendererComponent() = default;
        MeshRendererComponent(const MeshRendererComponent&) = default;
    };

    struct LightComponent
    {
        glm::vec3 color = { 1.0f, 1.0f, 1.0f };

        LightComponent() = default;
        LightComponent(const LightComponent&) = default;
    };
}
}
