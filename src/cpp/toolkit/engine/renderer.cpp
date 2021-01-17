#include "renderer.h"

#include "camera/camera.h"
#include "logger/assert.h"
#include "render_command.h"
#include "shader.h"
#include "vertex_array.h"

namespace tk {
namespace engine {
    std::unique_ptr<Renderer::SceneData> Renderer::data_ =
        std::make_unique<Renderer::SceneData>();

    void Renderer::init() { RenderCommand::init(); }

    void Renderer::shutdown() {}

    void Renderer::resize(uint32_t width, uint32_t height)
    {
        RenderCommand::set_viewport(0, 0, width, height);
    }

    void Renderer::begin(const Camera& camera)
    {
        data_->view_projection_ = camera.view_projection();
    }

    void Renderer::end() {}

    void Renderer::submit_fill_mode(FillMode mode)
    {
        RenderCommand::set_fill_mode(mode);
    }

    void Renderer::submit(const std::shared_ptr<Shader>& shader,
                          const std::shared_ptr<VertexArray>& vertex_array,
                          const glm::mat4& transform,
                          RenderMode mode)
    {
        CAT_ASSERT(shader);
        CAT_ASSERT(vertex_array);

        shader->bind();
        shader->set_uniform_mat4("u_view_projection", data_->view_projection_);
        shader->set_uniform_mat4("u_model", transform);

        vertex_array->bind();
        if (vertex_array->index_buffer()) {
            RenderCommand::draw_indexed(mode, vertex_array);
        } else {
            RenderCommand::draw_array(mode, vertex_array);
        }
    }
}
}
