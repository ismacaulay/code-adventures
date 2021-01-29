#include "toolkit/engine.h"

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

namespace {
static const char* BUNNY_MODEL_PATH = "assets/models/bunny/bunny.obj";
static const char* BUNNY_SHADER_PATH = "assets/shaders/bunny.glsl";
}

class ECSExample : public tk::engine::Layer
{
public:
    std::shared_ptr<tk::engine::OrbitCameraController> camera_controller_;

    tk::engine::Scene scene_;

    ECSExample() = default;
    ~ECSExample() = default;

    void attach(tk::engine::Engine& engine) override
    {
        const auto& window = engine.window();

        float width = static_cast<float>(window.width());
        float height = static_cast<float>(window.height());
        float aspect_ratio = width / height;

        auto orthographic_camera =
            std::make_shared<tk::engine::OrthographicCamera>(
                -1.0f, 1.0f, -1.0f, 1.0f, 0.0f, 10.0f, aspect_ratio);

        camera_controller_ =
            std::make_shared<tk::engine::OrbitCameraController>(
                window.width(), window.height());
        camera_controller_->set_orthographic_camera(orthographic_camera);
        camera_controller_->select_camera(tk::engine::CameraType::Orthographic);
        camera_controller_->set_position({ 0.0f, 0.0f, 1.0f });

        auto bunny_entity = scene_.create_entity();
        auto& model_renderer =
            bunny_entity.add_component<tk::engine::ModelRendererComponent>();
        model_renderer.model = tk::engine::ModelLoader::load(BUNNY_MODEL_PATH);
        model_renderer.shader =
            tk::engine::Shader::from_file(BUNNY_SHADER_PATH);
        model_renderer.fill_mode = tk::engine::FillMode::Line;

        auto& bunny_transform =
            bunny_entity.get_component<tk::engine::TransformComponent>();
        bunny_transform.transform =
            glm::translate(bunny_transform.transform, { -1.0f, 0.0f, 0.0f });
    }

    void detach(tk::engine::Engine& engine) override
    {
        camera_controller_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        scene_.update(delta);

        tk::engine::Renderer::end();
    }

    bool process_event(const tk::engine::Event& event) override
    {
        camera_controller_->on_event(event);
        return false;
    }
};

int main()
{
    tk::engine::WindowProps WINDOW_PROPS =
        tk::engine::WindowProps{ "ca: ecs example", 1280, 720 };

    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    auto engine = std::make_shared<tk::engine::Engine>(WINDOW_PROPS);
    engine->push_layer(std::make_shared<ECSExample>());

    engine->run();

    engine->shutdown();

    return 0;
}
