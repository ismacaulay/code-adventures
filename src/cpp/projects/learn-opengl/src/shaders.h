#pragma once
#include "tutorial.h"

#include "toolkit/engine.h"

#include "geometry.h"

class Shaders : public Tutorial
{
public:
    std::shared_ptr<tk::engine::VertexArray> va_;
    std::shared_ptr<tk::engine::Shader> shader_;
    tk::engine::OrthographicCamera camera_;

    Shaders()
        : Tutorial("Shaders")
        , camera_(-1.0f, 1.0f, -1.0f, 1.0f)
    {}
    ~Shaders() = default;

    void attach(tk::engine::Engine&) override
    {
        auto vb = tk::engine::VertexBuffer::create(
            TRIANGLE_VERTICES_WITH_COLOR.data(),
            sizeof(float) * TRIANGLE_VERTICES_WITH_COLOR.size());

        vb->set_layout({ { tk::engine::ShaderDataType::Float3, "a_position" },
                         { tk::engine::ShaderDataType::Float3, "a_color" } });

        // auto ib = tk::engine::IndexBuffer::create(SQUARE_INDICES.data(),
        //                                           SQUARE_INDICES.size());

        va_ = tk::engine::VertexArray::create();
        va_->add_vertex_buffer(vb);
        // va_->set_index_buffer(ib);

        std::string vertex_src = R"(
            #version 330 core

            layout (location = 0) in vec3 a_position;
            layout (location = 1) in vec3 a_color;

            uniform mat4 u_view_projection;

            out vec3 v_color;

            void main()
            {
                v_color = a_color;
                gl_Position = u_view_projection * vec4(a_position, 1.0);
            }
        )";

        std::string fragment_src = R"(
            #version 330 core

            in vec3 v_color;
            // uniform vec4 u_color;

            out vec4 color;

            void main()
            {
                // color = u_color;
                color = vec4(v_color, 1.0f);
            }
        )";
        shader_ = tk::engine::Shader::from_source(vertex_src, fragment_src);
    }

    void detach(tk::engine::Engine& engine) override
    {
        shader_ = nullptr;
        va_ = nullptr;
    }

    void update(float delta) override
    {
        tk::engine::RenderCommand::set_clear_color({ 0.2f, 0.3f, 0.3f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(camera_);

        // float time = tk::engine::Time::get_time();
        // float green_value = (sin(time) / 2.0f) + 0.5f;
        // shader_->bind();
        // shader_->set_uniform_vec4("u_color", { 0.0f, green_value, 0.0f, 1.0f
        // });

        tk::engine::Renderer::submit(shader_, va_);

        tk::engine::Renderer::end();
    }
};
