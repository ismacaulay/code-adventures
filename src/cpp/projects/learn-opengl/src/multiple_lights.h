#pragma once
#include "tutorial.h"

#include "defines.h"
#include "geometry.h"

class MultipleLights : public Tutorial
{
public:
    std::shared_ptr<tk::engine::Texture2D> diffuse_map_texture_;
    std::shared_ptr<tk::engine::Texture2D> specular_map_texture_;

    std::shared_ptr<tk::engine::VertexArray> cube_va_;
    std::shared_ptr<tk::engine::Shader> cube_shader_;
    glm::mat4 cube_model_;

    std::shared_ptr<tk::engine::VertexArray> light_va_;
    std::shared_ptr<tk::engine::Shader> light_shader_;
    glm::mat4 light_model_;

    std::shared_ptr<tk::engine::FreeCameraController> camera_controller_;

    MultipleLights()
        : Tutorial("MultipleLights")
    {}
    ~MultipleLights() = default;

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

        diffuse_map_texture_ =
            tk::engine::Texture2D::create("assets/container2.png");
        specular_map_texture_ =
            tk::engine::Texture2D::create("assets/container2_specular.png");

        auto vb = tk::engine::VertexBuffer::create(
            CUBE_VERTICES_WITH_NORMALS_TEXCOORDS.data(),
            sizeof(float) * CUBE_VERTICES_WITH_NORMALS_TEXCOORDS.size());
        vb->set_layout(
            { { tk::engine::ShaderDataType::Float3, "a_position" },
              { tk::engine::ShaderDataType::Float3, "a_normal" },
              { tk::engine::ShaderDataType::Float2, "a_tex_coord" } });

        glm::vec3 light_pos = { 1.2f, 1.0f, 2.0f };

        cube_va_ = tk::engine::VertexArray::create();
        cube_va_->add_vertex_buffer(vb);
        cube_shader_ = tk::engine::Shader::from_file(
            "assets/shaders/multiple_lights.glsl");
        cube_shader_->bind();

        // cube_shader_->set_uniform_vec3("u_dir_light.direction", { -0.2);

        cube_shader_->set_uniform_vec3("u_dir_light.direction",
                                       { -0.2f, -1.0f, -0.3f });
        cube_shader_->set_uniform_vec3("u_dir_light.ambient",
                                       { 0.05f, 0.05f, 0.05f });
        cube_shader_->set_uniform_vec3("u_dir_light.diffuse",
                                       { 0.4f, 0.4f, 0.4f });
        cube_shader_->set_uniform_vec3("u_dir_light.specular",
                                       { 0.5f, 0.5f, 0.5f });

        cube_shader_->set_uniform_vec3("u_point_lights[0].position",
                                       POINT_LIGHT_POSITIONS[0]);
        cube_shader_->set_uniform_vec3("u_point_lights[0].ambient",
                                       { 0.05f, 0.05f, 0.05f });
        cube_shader_->set_uniform_vec3("u_point_lights[0].diffuse",
                                       { 0.8f, 0.8f, 0.8f });
        cube_shader_->set_uniform_vec3("u_point_lights[0].specular",
                                       glm::vec3(1.0f));
        cube_shader_->set_uniform_float("u_point_lights[0].constant", 1.0f);
        cube_shader_->set_uniform_float("u_point_lights[0].linear", 0.09f);
        cube_shader_->set_uniform_float("u_point_lights[0].quadratic", 0.032f);

        cube_shader_->set_uniform_vec3("u_point_lights[1].position",
                                       POINT_LIGHT_POSITIONS[1]);
        cube_shader_->set_uniform_vec3("u_point_lights[1].ambient",
                                       { 0.05f, 0.05f, 0.05f });
        cube_shader_->set_uniform_vec3("u_point_lights[1].diffuse",
                                       { 0.8f, 0.8f, 0.8f });
        cube_shader_->set_uniform_vec3("u_point_lights[1].specular",
                                       glm::vec3(1.0f));
        cube_shader_->set_uniform_float("u_point_lights[1].constant", 1.0f);
        cube_shader_->set_uniform_float("u_point_lights[1].linear", 0.09f);
        cube_shader_->set_uniform_float("u_point_lights[1].quadratic", 0.032f);

        cube_shader_->set_uniform_vec3("u_point_lights[2].position",
                                       POINT_LIGHT_POSITIONS[2]);
        cube_shader_->set_uniform_vec3("u_point_lights[2].ambient",
                                       { 0.05f, 0.05f, 0.05f });
        cube_shader_->set_uniform_vec3("u_point_lights[2].diffuse",
                                       { 0.8f, 0.8f, 0.8f });
        cube_shader_->set_uniform_vec3("u_point_lights[2].specular",
                                       glm::vec3(1.0f));
        cube_shader_->set_uniform_float("u_point_lights[2].constant", 1.0f);
        cube_shader_->set_uniform_float("u_point_lights[2].linear", 0.09f);
        cube_shader_->set_uniform_float("u_point_lights[2].quadratic", 0.032f);

        cube_shader_->set_uniform_vec3("u_point_lights[3].position",
                                       POINT_LIGHT_POSITIONS[3]);
        cube_shader_->set_uniform_vec3("u_point_lights[3].ambient",
                                       { 0.05f, 0.05f, 0.05f });
        cube_shader_->set_uniform_vec3("u_point_lights[3].diffuse",
                                       { 0.8f, 0.8f, 0.8f });
        cube_shader_->set_uniform_vec3("u_point_lights[3].specular",
                                       glm::vec3(1.0f));
        cube_shader_->set_uniform_float("u_point_lights[3].constant", 1.0f);
        cube_shader_->set_uniform_float("u_point_lights[3].linear", 0.09f);
        cube_shader_->set_uniform_float("u_point_lights[3].quadratic", 0.032f);

        cube_shader_->set_uniform_int("u_material.diffuse", 0);
        cube_shader_->set_uniform_int("u_material.specular", 1);
        cube_shader_->set_uniform_float("u_material.shininess", 64.0f);

        cube_model_ = glm::mat4(1.0f);

        light_va_ = tk::engine::VertexArray::create();
        light_va_->add_vertex_buffer(vb);
        light_shader_ = tk::engine::Shader::from_file(
            "assets/shaders/cube.vert", "assets/shaders/light.frag");
    }

    void detach(tk::engine::Engine& engine) override
    {
        camera_controller_ = nullptr;

        light_shader_ = nullptr;
        light_va_ = nullptr;

        cube_shader_ = nullptr;
        cube_va_ = nullptr;

        specular_map_texture_ = nullptr;
        diffuse_map_texture_ = nullptr;
    }

    void update(float delta) override
    {
        camera_controller_->update(delta);

        tk::engine::RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 0.1f });
        tk::engine::RenderCommand::clear();

        tk::engine::Renderer::begin(*camera_controller_->camera());

        diffuse_map_texture_->bind(0);
        specular_map_texture_->bind(1);

        cube_shader_->bind();
        cube_shader_->set_uniform_vec3("u_view_pos",
                                       camera_controller_->position());

        cube_shader_->set_uniform_vec3("u_spot_light.position",
                                       camera_controller_->position());
        cube_shader_->set_uniform_vec3("u_spot_light.direction",
                                       camera_controller_->front());
        cube_shader_->set_uniform_float("u_spot_light.cutoff",
                                        glm::cos(glm::radians(12.5f)));
        cube_shader_->set_uniform_float("u_spot_light.outer_cutoff",
                                        glm::cos(glm::radians(15.0f)));
        cube_shader_->set_uniform_vec3("u_spot_light.ambient",
                                       { 0.0f, 0.0f, 0.0f });
        cube_shader_->set_uniform_vec3("u_spot_light.diffuse", glm::vec3(1.0f));
        cube_shader_->set_uniform_vec3("u_spot_light.specular",
                                       glm::vec3(1.0f));
        cube_shader_->set_uniform_float("u_spot_light.constant", 1.0f);
        cube_shader_->set_uniform_float("u_spot_light.linear", 0.09f);
        cube_shader_->set_uniform_float("u_spot_light.quadratic", 0.032f);

        for (int i = 0; i < CUBE_POSITIONS.size(); i++) {
            glm::mat4 model(1.0f);
            model = glm::translate(model, CUBE_POSITIONS[i]);
            float angle = 20.0f * i;
            model = glm::rotate(model, angle, { 1.0f, 0.3f, 0.5f });
            tk::engine::Renderer::submit(cube_shader_, cube_va_, model);
        }

        for (int i = 0; i < POINT_LIGHT_POSITIONS.size(); i++) {
            glm::mat4 model(1.0f);
            model = glm::translate(model, POINT_LIGHT_POSITIONS[i]);
            model = glm::scale(model, glm::vec3(0.2f));
            tk::engine::Renderer::submit(light_shader_, light_va_, model);
        }

        tk::engine::Renderer::end();
    }

    bool process_event(const tk::engine::Event& event) override
    {
        camera_controller_->on_event(event);
        return false;
    }
};
