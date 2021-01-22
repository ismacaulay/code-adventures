#pragma once
#include "tutorial.h"

#include "toolkit/engine.h"

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "geometry.h"

class Transformations : public Tutorial
{
public:
    std::shared_ptr<tk::engine::VertexArray> va_;
    std::shared_ptr<tk::engine::Shader> shader_;
    std::shared_ptr<tk::engine::Texture2D> texture1_;
    std::shared_ptr<tk::engine::Texture2D> texture2_;

    tk::engine::OrthographicCamera camera_;

    Transformations()
        : Tutorial("Transformations")
        , camera_(-1.0f, 1.0f, -1.0f, 1.0f)
    {}
    ~Transformations() = default;

    void attach(const tk::engine::Engine&) override
    {

        auto vb = tk::engine::VertexBuffer::create(
            SQUARE_VERTICES_WITH_COLORS_TEXCOORDS.data(),
            sizeof(float) * SQUARE_VERTICES_WITH_COLORS_TEXCOORDS.size());

        vb->set_layout(
            { { tk::engine::ShaderDataType::Float3, "a_position" },
              { tk::engine::ShaderDataType::Float3, "a_color" },
              { tk::engine::ShaderDataType::Float2, "a_tex_coord" } });

        auto ib = tk::engine::IndexBuffer::create(
            SQUARE_INDICES.data(), sizeof(uint32_t) * SQUARE_INDICES.size());

        va_ = tk::engine::VertexArray::create();
        va_->add_vertex_buffer(vb);
        va_->set_index_buffer(ib);

        std::string vertex_src = R"(
            #version 330 core

            layout (location = 0) in vec3 a_position;
            layout (location = 1) in vec3 a_color;
            layout (location = 2) in vec2 a_tex_coord;

            uniform mat4 u_view_projection;
            uniform mat4 u_model;

            out vec3 v_color;
            out vec2 v_tex_coord;

            void main()
            {
                v_color = a_color;
                v_tex_coord = a_tex_coord;
                gl_Position = u_view_projection * u_model * vec4(a_position, 1.0);
            }
        )";

        std::string fragment_src = R"(
            #version 330 core

            in vec3 v_color;
            in vec2 v_tex_coord;

            uniform sampler2D u_texture1;
            uniform sampler2D u_texture2;

            out vec4 color;

            void main()
            {
                color = mix(texture(u_texture1, v_tex_coord), texture(u_texture2, v_tex_coord), 0.2) * vec4(v_color, 1.0);
            }
        )";

        shader_ = tk::engine::Shader::from_source(vertex_src, fragment_src);
        shader_->bind();

        texture1_ = tk::engine::Texture2D::create("assets/container.jpg");
        shader_->set_uniform_int("u_texture1", 0);

        texture2_ = tk::engine::Texture2D::create("assets/awesomeface.png");
        shader_->set_uniform_int("u_texture2", 1);
    }

    void detach(const tk::engine::Engine& engine) override
    {
        texture2_ = nullptr;
        texture1_ = nullptr;
        shader_ = nullptr;
        va_ = nullptr;
    }

    void update(float delta) override
    {
        tk::engine::RenderCommand::set_clear_color({ 0.2f, 0.3f, 0.3f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(camera_);

        glm::mat4 model(1.0f);
        model = glm::rotate(
            model, tk::engine::Time::get_time(), { 0.0f, 0.0f, 1.0f });
        model = glm::scale(model, { 0.5f, 0.5f, 1.0f });

        texture1_->bind(0);
        texture2_->bind(1);
        tk::engine::Renderer::submit(shader_, va_, model);

        tk::engine::Renderer::end();
    }
};
