#include "scene.h"

#include "components.h"
#include "engine/rendering/render_command.h"
#include "engine/rendering/renderer.h"

namespace tk {
namespace engine {
    Scene::Scene() {}
    Scene::~Scene() { registry_.clear(); }

    Entity Scene::create_entity(const std::string& name)
    {
        auto entity = registry_.create();
        registry_.emplace<TagComponent>(entity, name);
        registry_.emplace<TransformComponent>(entity);
        return Entity{ entity, &registry_ };
    }

    void Scene::update(float delta)
    {
        auto directional_lights =
            registry_.view<TransformComponent, LightComponent>();
        {
            auto view =
                registry_.view<TransformComponent, ModelRendererComponent>();
            for (auto entity : view) {
                auto& transform = view.get<TransformComponent>(entity);
                auto& renderer = view.get<ModelRendererComponent>(entity);

                auto& shader = renderer.shader;
                add_lights_to_shader(shader);

                RenderCommand::set_fill_mode(renderer.fill_mode);
                renderer.model->render(renderer.shader, transform.transform());
            }
        }

        {

            auto view =
                registry_.view<TransformComponent, MeshRendererComponent>();
            for (auto entity : view) {
                auto& renderer = view.get<MeshRendererComponent>(entity);

                auto& shader = renderer.shader;
                add_lights_to_shader(shader);

                auto& transform = view.get<TransformComponent>(entity);
                RenderCommand::set_fill_mode(renderer.fill_mode);
                Renderer::submit(
                    shader, renderer.geometry, transform.transform());
            }
        }
    }

    void Scene::add_lights_to_shader(std::shared_ptr<Shader>& shader)
    {
        auto lights = registry_.view<TransformComponent, LightComponent>();
        shader->bind();
        for (auto entity : lights) {
            auto& transform = lights.get<TransformComponent>(entity);
            auto& light = lights.get<LightComponent>(entity);

            shader->set_uniform_vec3("u_light.position", transform.translation);
            shader->set_uniform_vec3("u_light.color", light.color);
        }
    }
}
}
