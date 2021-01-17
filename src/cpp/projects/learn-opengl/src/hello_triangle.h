#pragma once
#include "tutorial.h"

class HelloTriangle : public Tutorial
{
public:
    std::shared_ptr<tk::engine::VertexArray> va_;
    std::shared_ptr<tk::engine::Shader> shader_;
    tk::engine::OrthographicCamera camera_;

    HelloTriangle()
        : Tutorial("Hello Triangle")
    {}
    ~HelloTriangle(){};

    void attach() override
    {
        camera_.set_position({ 0.0, 0.0, 5.0 });

        // clang-format off
        // std::vector<float> vertices = {
        //     -0.5f, -0.5f, 0.0f,
        //      0.5f, -0.5f, 0.0f,
        //      0.0f,  0.5f, 0.0f
        // };
        std::vector<float> vertices = {
            0.5f, 0.5f, 0.0f,
            0.5f, -0.5f, 0.0f,
            -0.5f, -0.5f, 0.0f,
            -0.5f, 0.5f, 0.0f
        };

        std::vector<uint32_t> indices = {
            0, 1, 3,
            1, 2, 3
        };
        // clang-format on

        auto vb = std::make_shared<tk::engine::VertexBuffer>(
            vertices.data(), sizeof(float) * vertices.size());
        vb->set_layout(
            { { tk::engine::ShaderDataType::Float3, "a_position" } });

        auto ib = std::make_shared<tk::engine::IndexBuffer>(
            indices.data(), sizeof(uint32_t) * indices.size());

        va_ = std::make_shared<tk::engine::VertexArray>();
        va_->add_vertex_buffer(vb);
        va_->set_index_buffer(ib);

        std::string vertex_src = R"(
            #version 330 core

            layout (location = 0) in vec3 a_position;

            uniform mat4 u_view_projection;

            out vec3 v_position;

            void main()
            {
                // v_position = a_position;
                // gl_Position = u_view_projection * vec4(a_position, 1.0);
                gl_Position = vec4(a_position, 1.0);
            }
        )";

        std::string fragment_src = R"(
            #version 330 core

            // in vec3 v_position;

            out vec4 color;

            void main()
            {
                // color = vec4(v_position * 0.5 + 0.5, 1.0);
                // color = vec4(1.0, 0.0, 0.0, 1.0);
                color = vec4(1.0f, 0.5f, 0.2f, 1.0f);
            }
        )";
        shader_ = tk::engine::Shader::from_source(vertex_src, fragment_src);

        tk::engine::RenderCommand::set_fill_mode(tk::engine::FillMode::Line);
    }

    void detach() override
    {
        shader_ = nullptr;
        va_ = nullptr;
    }

    void update(float delta) override
    {
        tk::engine::RenderCommand::set_clear_color({ 0.2f, 0.3f, 0.3f, 1.0f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(camera_);

        tk::engine::Renderer::submit(shader_, va_);

        tk::engine::Renderer::end();
    }
};
