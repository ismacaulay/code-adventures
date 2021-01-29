#include "scene.h"

#include "components.h"
#include "engine/rendering/render_command.h"

namespace tk {
namespace engine {
    Scene::Scene() {}
    Scene::~Scene() { registry_.clear(); }

    Entity Scene::create_entity()
    {
        auto entity = registry_.create();
        registry_.emplace<TransformComponent>(entity);
        return Entity{ entity, &registry_ };
    }

    void Scene::update(float delta)
    {
        auto view =
            registry_.view<TransformComponent, ModelRendererComponent>();
        for (auto entity : view) {
            auto& transform = view.get<TransformComponent>(entity);
            auto& renderer = view.get<ModelRendererComponent>(entity);
            RenderCommand::set_fill_mode(renderer.fill_mode);
            renderer.model->render(renderer.shader, transform.transform);
        }
    }
}
}
