#pragma once
#include "tutorial.h"

#include "toolkit/engine.h"

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "geometry.h"

class CoordinateSystems : public Tutorial
{
public:
    std::shared_ptr<tk::engine::VertexArray> va_;
    std::shared_ptr<tk::engine::Shader> shader_;
    std::shared_ptr<tk::engine::Texture2D> texture1_;
    std::shared_ptr<tk::engine::Texture2D> texture2_;

    std::shared_ptr<tk::engine::FreeCameraController> camera_controller_;
    std::vector<glm::vec3> cubePositions_;

    CoordinateSystems()
        : Tutorial("Coordinate Systems")
    {
        auto camera = std::make_shared<tk::engine::PerspectiveCamera>(
            45.0f, 1280.0f / 720.0f, 0.1f, 100.0f);
        camera_controller_ =
            std::make_shared<tk::engine::FreeCameraController>();
        camera_controller_->set_perspective_camera(camera);
        camera_controller_->select_camera(tk::engine::CameraType::Perspective);
    }
    ~CoordinateSystems() = default;

    void attach(tk::engine::Engine&) override
    {
        auto vb = tk::engine::VertexBuffer::create(
            CUBE_VERTICES_WITH_TEXCOORDS.data(),
            sizeof(float) * CUBE_VERTICES_WITH_TEXCOORDS.size());

        vb->set_layout(
            { { tk::engine::ShaderDataType::Float3, "a_position" },
              { tk::engine::ShaderDataType::Float2, "a_tex_coord" } });

        va_ = tk::engine::VertexArray::create();
        va_->add_vertex_buffer(vb);

        std::string vertex_src = R"(
            #version 330 core

            layout (location = 0) in vec3 a_position;
            layout (location = 1) in vec2 a_tex_coord;

            uniform mat4 u_view_projection;
            uniform mat4 u_model;

            out vec2 v_tex_coord;

            void main()
            {
                v_tex_coord = a_tex_coord;
                gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
            }
        )";

        std::string fragment_src = R"(
            #version 330 core

            in vec2 v_tex_coord;

            uniform sampler2D u_texture1;
            uniform sampler2D u_texture2;

            out vec4 color;

            void main()
            {
                color = mix(texture(u_texture1, v_tex_coord), texture(u_texture2, v_tex_coord), 0.2);
            }
        )";

        shader_ = tk::engine::Shader::from_source(vertex_src, fragment_src);
        shader_->bind();

        texture1_ = tk::engine::Texture2D::create("assets/container.jpg");
        shader_->set_uniform_int("u_texture1", 0);

        texture2_ = tk::engine::Texture2D::create("assets/awesomeface.png");
        shader_->set_uniform_int("u_texture2", 1);

        camera_controller_->set_position({ 0.0f, 0.0f, 3.0f });

        cubePositions_ = {
            glm::vec3(0.0f, 0.0f, 0.0f),    glm::vec3(2.0f, 5.0f, -15.0f),
            glm::vec3(-1.5f, -2.2f, -2.5f), glm::vec3(-3.8f, -2.0f, -12.3f),
            glm::vec3(2.4f, -0.4f, -3.5f),  glm::vec3(-1.7f, 3.0f, -7.5f),
            glm::vec3(1.3f, -2.0f, -2.5f),  glm::vec3(1.5f, 2.0f, -2.5f),
            glm::vec3(1.5f, 0.2f, -1.5f),   glm::vec3(-1.3f, 1.0f, -1.5f)
        };
    }

    void detach(tk::engine::Engine& engine) override
    {
        camera_controller_ = nullptr;
        texture2_ = nullptr;
        texture1_ = nullptr;
        shader_ = nullptr;
        va_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.2f, 0.3f, 0.3f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        texture1_->bind(0);
        texture2_->bind(1);
        for (int i = 0; i < cubePositions_.size(); i++) {
            glm::mat4 model(1.0f);
            model = glm::translate(model, cubePositions_[i]);
            float angle = 20.0f * i;
            model = glm::rotate(model, angle, { 1.0f, 0.3f, 0.5f });
            tk::engine::Renderer::submit(shader_, va_, model);
        }

        tk::engine::Renderer::end();
    }
};
