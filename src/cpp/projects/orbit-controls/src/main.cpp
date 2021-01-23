#include "toolkit/engine.h"
#include <glm/glm.hpp>

class OrbitControls : public tk::engine::Layer
{
public:
    std::shared_ptr<tk::engine::OrbitCameraController> camera_controller_;

    std::shared_ptr<tk::engine::Shader> model_shader_;
    std::unique_ptr<tk::engine::Model> model_;

    OrbitControls() = default;
    ~OrbitControls() = default;

    void attach(const tk::engine::Engine& engine) override
    {
        const auto& window = engine.window();

        float width = static_cast<float>(window.width());
        float height = static_cast<float>(window.height());
        float aspect_ratio = width / height;

        auto perspective_camera =
            std::make_shared<tk::engine::PerspectiveCamera>(
                glm::radians(45.0f), aspect_ratio, 0.1f, 100.0f);

        auto orthographic_camera =
            std::make_shared<tk::engine::OrthographicCamera>(
                -1.0f, 1.0f, -1.0f, 1.0f, 0.0f, 10.0f, aspect_ratio);

        camera_controller_ =
            std::make_shared<tk::engine::OrbitCameraController>(
                window.width(), window.height());
        camera_controller_->set_perspective_camera(perspective_camera);
        camera_controller_->set_orthographic_camera(orthographic_camera);
        camera_controller_->select_camera(tk::engine::CameraType::Orthographic);
        camera_controller_->set_position({ 0.0f, 0.0f, 1.0f });

        model_shader_ =
            tk::engine::Shader::from_file("assets/shaders/bunny.glsl");
        model_ = tk::engine::ModelLoader::load("assets/models/bunny/bunny.obj");

        tk::engine::RenderCommand::set_fill_mode(tk::engine::FillMode::Line);
    }

    void detach(const tk::engine::Engine& engine) override
    {
        model_ = nullptr;
        model_shader_ = nullptr;
        camera_controller_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        model_->render(model_shader_);

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
        tk::engine::WindowProps{ "ca: orbit controls", 1280, 720 };

    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    auto engine = std::make_shared<tk::engine::Engine>(WINDOW_PROPS);
    engine->push_layer(std::make_shared<OrbitControls>());

    engine->run();

    engine->shutdown();

    return 0;
}
