#pragma once
#include "tutorial.h"

#include "defines.h"
#include "geometry.h"

class Materials : public Tutorial
{
public:
    std::shared_ptr<tk::engine::VertexArray> cube_va_;
    std::shared_ptr<tk::engine::Shader> cube_shader_;
    glm::mat4 cube_model_;

    std::shared_ptr<tk::engine::VertexArray> light_va_;
    std::shared_ptr<tk::engine::Shader> light_shader_;
    glm::mat4 light_model_;

    std::shared_ptr<tk::engine::FreeCameraController> camera_controller_;

    Materials()
        : Tutorial("Materials")
    {}
    ~Materials() = default;

    void attach(tk::engine::Engine& engine) override
    {
        auto perspective_camera =
            std::make_shared<tk::engine::PerspectiveCamera>(
                45.0f, engine.window().aspect(), 0.1f, 100.0f);
        camera_controller_ =
            std::make_shared<tk::engine::FreeCameraController>();
        camera_controller_->set_perspective_camera(perspective_camera);
        camera_controller_->select_camera(tk::engine::CameraType::Perspective);
        camera_controller_->set_position({ 0.0f, 0.0f, 3.0f });
        engine.window().set_cursor_enabled(false);

        auto vb = tk::engine::VertexBuffer::create(
            CUBE_VERTICES_WITH_NORMALS.data(),
            sizeof(float) * CUBE_VERTICES_WITH_NORMALS.size());
        vb->set_layout({ { tk::engine::ShaderDataType::Float3, "a_position" },
                         { tk::engine::ShaderDataType::Float3, "a_normal" } });

        glm::vec3 light_pos = { 1.2f, 1.0f, 2.0f };

        cube_va_ = tk::engine::VertexArray::create();
        cube_va_->add_vertex_buffer(vb);
        cube_shader_ = tk::engine::Shader::from_file(
            "assets/shaders/phong.vert", "assets/shaders/phong_materials.frag");
        cube_shader_->bind();
        cube_shader_->set_uniform_vec3("u_color", { 1.0f, 0.5f, 0.31f });

        cube_shader_->set_uniform_vec3("u_light.position", light_pos);
        // cube_shader_->set_uniform_vec3("u_light.ambient", { 0.2f, 0.2f, 0.2f
        // }); cube_shader_->set_uniform_vec3("u_light.diffuse", { 0.5f, 0.5f,
        // 0.5f }); cube_shader_->set_uniform_vec3("u_light.specular",
        //                                { 1.0f, 1.0f, 1.0f });

        // cube_shader_->set_uniform_vec3("u_material.ambient",
        //                                { 1.0f, 0.5f, 0.31f });
        // cube_shader_->set_uniform_vec3("u_material.diffuse",
        //                                { 1.0f, 0.5f, 0.31f });
        // cube_shader_->set_uniform_vec3("u_material.specular",
        //                                { 0.5f, 0.5f, 0.5f });

        // materials require light intensities of 1.0
        // Material material = SILVER;
        Material material = GREEN_RUBBER;
        cube_shader_->set_uniform_vec3("u_light.ambient", glm::vec3(1.0f));
        cube_shader_->set_uniform_vec3("u_light.diffuse", glm::vec3(1.0f));
        cube_shader_->set_uniform_vec3("u_light.specular", glm::vec3(1.0f));

        cube_shader_->set_uniform_vec3("u_material.ambient", material.ambient);
        cube_shader_->set_uniform_vec3("u_material.diffuse", material.diffuse);
        cube_shader_->set_uniform_vec3("u_material.specular",
                                       material.specular);
        cube_shader_->set_uniform_float("u_material.shininess",
                                        material.shininess * 128.0f);

        cube_model_ = glm::mat4(1.0f);

        light_va_ = tk::engine::VertexArray::create();
        light_va_->add_vertex_buffer(vb);
        light_shader_ = tk::engine::Shader::from_file(
            "assets/shaders/cube.vert", "assets/shaders/light.frag");

        light_model_ = glm::mat4(1.0f);
        light_model_ = glm::translate(light_model_, light_pos);
        light_model_ = glm::scale(light_model_, glm::vec3(0.2f));
    }

    void detach(tk::engine::Engine& engine) override
    {
        camera_controller_ = nullptr;

        light_shader_ = nullptr;
        light_va_ = nullptr;

        cube_shader_ = nullptr;
        cube_va_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 0.1f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        cube_shader_->bind();
        cube_shader_->set_uniform_vec3("u_view_pos",
                                       camera_controller_->position());

        // glm::vec3 light_color = {
        //     std::sin(tk::engine::Time::get_time() * 2.0f),
        //     std::sin(tk::engine::Time::get_time() * 0.7f),
        //     std::sin(tk::engine::Time::get_time() * 1.3f),
        // };
        //
        // glm::vec3 ambient_color = light_color * glm::vec3(0.2f);
        // glm::vec3 diffuse_color = light_color * glm::vec3(0.5f);
        // cube_shader_->set_uniform_vec3("u_light.ambient", ambient_color);
        // cube_shader_->set_uniform_vec3("u_light.diffuse", diffuse_color);

        tk::engine::Renderer::submit(cube_shader_, cube_va_, cube_model_);
        tk::engine::Renderer::submit(light_shader_, light_va_, light_model_);

        tk::engine::Renderer::end();
    }

    bool process_event(const tk::engine::Event& event) override
    {
        camera_controller_->on_event(event);
        return false;
    }
};
