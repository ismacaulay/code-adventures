#include "renderer.h"

#include "engine/camera/camera.h"
#include "geometry/geometry.h"
#include "index_buffer.h"
#include "logger/assert.h"
#include "logger/log.h"
#include "render_command.h"
#include "shader.h"
#include "vertex_array.h"
#include "vertex_buffer.h"

namespace tk {
namespace engine {
    std::unique_ptr<Renderer::SceneData> Renderer::data_ = nullptr;

    void Renderer::init()
    {
        data_ = std::make_unique<Renderer::SceneData>();

        RenderCommand::init();
    }

    void Renderer::shutdown() { data_ = nullptr; }

    void Renderer::resize(uint32_t width, uint32_t height)
    {
        RenderCommand::set_viewport(0, 0, width, height);
    }

    void Renderer::begin(const Camera& camera)
    {
        data_->view_projection = camera.view_projection();
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
        shader->set_uniform_mat4("u_view_projection", data_->view_projection);
        shader->set_uniform_mat4("u_model", transform);

        vertex_array->bind();
        if (vertex_array->index_buffer()) {
            RenderCommand::draw_indexed(
                mode, vertex_array, vertex_array->index_buffer()->count());
        } else {
            RenderCommand::draw_array(mode, vertex_array);
        }
    }

    void Renderer::submit(
        const std::shared_ptr<Shader>& shader,
        const std::shared_ptr<geometry::MeshGeometry>& geometry,
        const glm::mat4& transform,
        RenderMode mode)
    {
        auto it = data_->va_map.find(geometry.get());
        if (it != data_->va_map.end()) {
            submit(shader, it->second, transform, mode);
            return;
        }

        auto vb =
            VertexBuffer::create(geometry->positions.data(),
                                 sizeof(float) * geometry->positions.size());
        vb->set_layout({ { ShaderDataType::Float3, "a_position" } });

        auto ib =
            IndexBuffer::create(geometry->indices.data(),
                                sizeof(uint32_t) * geometry->indices.size());

        auto va = VertexArray::create();
        va->set_index_buffer(ib);
        va->add_vertex_buffer(vb);

        data_->va_map[geometry.get()] = va;
        submit(shader, va, transform, mode);
    }
}
}
