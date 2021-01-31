#include "toolkit/engine.h"
#include "toolkit/math.h"
#include <glm/glm.hpp>

class Engine2D : public tk::engine::Layer
{
public:
    std::shared_ptr<tk::engine::CameraController2D> camera_controller_;
    std::shared_ptr<tk::engine::Texture2D> texture_;
    glm::mat4 texture_quad_transform_;

    Engine2D() = default;
    ~Engine2D() = default;

    void attach(tk::engine::Engine& engine) override
    {
        const auto& window = engine.window();

        float width = static_cast<float>(window.width());
        float height = static_cast<float>(window.height());
        float aspect_ratio = width / height;

        auto orthographic_camera =
            std::make_shared<tk::engine::OrthographicCamera2D>();

        camera_controller_ = std::make_shared<tk::engine::CameraController2D>(
            orthographic_camera, aspect_ratio);

        texture_ =
            tk::engine::Texture2D::create("assets/textures/awesomeface.png");
        texture_quad_transform_ = glm::mat4(1.0f);
        texture_quad_transform_ =
            glm::translate(texture_quad_transform_, { 2.0f, 0.0f, 0.0f });
        texture_quad_transform_ =
            glm::scale(texture_quad_transform_, { 2.0f, 2.0f, 1.0f });

        // orthographic_camera->set_projection_from_box(model_->bounding_box());
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

        tk::engine::Renderer2D::begin(camera_controller_->camera());

        tk::engine::Renderer2D::draw_quad(glm::mat4(1.0f),
                                          { 1.0f, 0.0f, 0.0f, 1.0f });

        tk::engine::Renderer2D::draw_quad(texture_quad_transform_, texture_);
        tk::engine::Renderer2D::end();
    }

    bool process_event(const tk::engine::Event& event) override
    {
        camera_controller_->on_event(event);
        return false;
    }
};

int main()
{
    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    auto engine_props =
        tk::engine::EngineProps{ tk::engine::RendererType::Renderer2D };
    auto window_props = tk::engine::WindowProps{ "ca: engine2d", 1280, 720 };

    auto engine =
        std::make_shared<tk::engine::Engine>(engine_props, window_props);

    engine->push_layer(std::make_shared<Engine2D>());
    engine->run();
    engine->shutdown();

    return 0;
}
