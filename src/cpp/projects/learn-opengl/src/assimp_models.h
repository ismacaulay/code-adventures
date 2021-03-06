#pragma once
#include "tutorial.h"

#include "geometry.h"

class AssimpModels : public Tutorial
{
public:
    std::shared_ptr<tk::engine::FreeCameraController> camera_controller_;

    std::shared_ptr<tk::engine::Shader> model_shader_;
    std::unique_ptr<tk::engine::Model> model_;

    AssimpModels()
        : Tutorial("Assimp Models")
    {}
    ~AssimpModels() = default;

    void attach(tk::engine::Engine& engine) override
    {
        const auto& window = engine.window();

        float aspect_ratio = static_cast<float>(window.width()) /
                             static_cast<float>(window.height());

        auto perspective_camera =
            std::make_shared<tk::engine::PerspectiveCamera>(
                glm::radians(45.0f), aspect_ratio, 0.1f, 100.0f);

        camera_controller_ =
            std::make_shared<tk::engine::FreeCameraController>();
        camera_controller_->set_perspective_camera(perspective_camera);
        camera_controller_->select_camera(tk::engine::CameraType::Perspective);
        camera_controller_->set_position({ 0.0f, 0.0f, 10.0f });

        model_shader_ =
            tk::engine::Shader::from_file("assets/shaders/model_shader.glsl");
        model_ = tk::engine::ModelLoader::load(
            "assets/models/nanosuit/nanosuit.obj");
    }

    void detach(tk::engine::Engine& engine) override
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
