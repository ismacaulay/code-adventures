#pragma once
#include "tutorial.h"

#include "geometry.h"

class DepthTesting : public Tutorial
{
public:
    std::shared_ptr<tk::engine::Shader> shader_;

    std::shared_ptr<tk::engine::VertexArray> cube_va_;
    glm::mat4 cube_model1_;
    glm::mat4 cube_model2_;

    std::shared_ptr<tk::engine::VertexArray> plane_va_;
    glm::mat4 plane_model_;

    std::shared_ptr<tk::engine::Texture2D> cube_texture_;
    std::shared_ptr<tk::engine::Texture2D> floor_texture_;

    std::shared_ptr<tk::engine::FreeCameraController> camera_controller_;

    DepthTesting()
        : Tutorial("Depth testing")
    {}
    ~DepthTesting() = default;

    void attach(tk::engine::Engine& engine) override
    {
        auto perspective_camera =
            std::make_shared<tk::engine::PerspectiveCamera>(
                45.0f, engine.window().aspect(), 0.1f, 100.0f);
        engine.window().set_cursor_enabled(false);
        camera_controller_ =
            std::make_shared<tk::engine::FreeCameraController>();
        camera_controller_->set_perspective_camera(perspective_camera);
        camera_controller_->select_camera(tk::engine::CameraType::Perspective);
        camera_controller_->set_position({ 0.0f, 0.0f, 3.0f });

        auto vb = tk::engine::VertexBuffer::create(
            CUBE_VERTICES_WITH_TEXCOORDS.data(),
            sizeof(float) * CUBE_VERTICES_WITH_TEXCOORDS.size());
        vb->set_layout({ { tk::engine::ShaderDataType::Float3, "a_position" },
                         { tk::engine::ShaderDataType::Float2, "a_uv" } });
        cube_va_ = tk::engine::VertexArray::create();
        cube_va_->add_vertex_buffer(vb);

        shader_ =
            tk::engine::Shader::from_file("assets/shaders/depth_testing.glsl");
        cube_model1_ = glm::mat4(1.0f);
        cube_model1_ = glm::translate(cube_model1_, { -1.0f, 0.0f, -1.0f });

        cube_model2_ = glm::mat4(1.0f);
        cube_model2_ = glm::translate(cube_model2_, { 2.0f, 0.0f, 0.0f });

        vb = tk::engine::VertexBuffer::create(
            PLANE_VERTICES.data(), sizeof(float) * PLANE_VERTICES.size());
        vb->set_layout({ { tk::engine::ShaderDataType::Float3, "a_position" },
                         { tk::engine::ShaderDataType::Float2, "a_uv" } });
        plane_va_ = tk::engine::VertexArray::create();
        plane_va_->add_vertex_buffer(vb);
        plane_model_ = glm::mat4(1.0f);

        shader_->bind();
        cube_texture_ =
            tk::engine::Texture2D::create("assets/textures/marble.jpg");
        floor_texture_ =
            tk::engine::Texture2D::create("assets/textures/metal.png");

        shader_->set_uniform_int("u_texture1", 0);

        tk::engine::RenderCommand::enable_depth_test(true);
        tk::engine::RenderCommand::set_depth_func(tk::engine::DepthFunc::Less);
    }

    void detach(tk::engine::Engine& engine) override
    {
        camera_controller_ = nullptr;

        floor_texture_ = nullptr;
        cube_texture_ = nullptr;
        plane_va_ = nullptr;
        cube_va_ = nullptr;
        shader_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 0.1f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        cube_texture_->bind();
        tk::engine::Renderer::submit(shader_, cube_va_, cube_model1_);
        tk::engine::Renderer::submit(shader_, cube_va_, cube_model2_);

        floor_texture_->bind();
        tk::engine::Renderer::submit(shader_, plane_va_, plane_model_);

        tk::engine::Renderer::end();
    }

    bool process_event(const tk::engine::Event& event) override
    {
        camera_controller_->on_event(event);
        return false;
    }
};
