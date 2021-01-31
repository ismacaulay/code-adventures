#include "renderer2d.h"

#include "engine/camera/orthographic_camera2d.h"
#include "index_buffer.h"
#include "logger/assert.h"
#include "render_command.h"
#include "shader.h"
#include "texture2d.h"
#include "vertex_array.h"
#include "vertex_buffer.h"

namespace tk {
namespace engine {
    namespace {
        struct Vertex
        {
            glm::vec3 position;
            glm::vec4 color;
            glm::vec2 uv;
            float texture_idx;

            template <typename OStream>
            friend OStream& operator<<(OStream& os, const Vertex& v)
            {
                return os << "[Vertex] p:" << v.position << " c:" << v.color;
            }
        };

        struct Data
        {
            static const uint32_t max_quads = 20000;
            static const uint32_t max_vertices = max_quads * 4;
            static const uint32_t max_indices = max_quads * 6;
            // TODO: This should be queried for based on the GPU capabilities
            static const uint32_t max_texture_slots = 32;

            std::shared_ptr<VertexArray> va;
            std::shared_ptr<VertexBuffer> vb;
            std::shared_ptr<Shader> shader;
            std::shared_ptr<Texture2D> white_texture;

            uint32_t index_count = 0;
            Vertex* vertex_buffer_base = nullptr;
            Vertex* vertex_buffer_ptr = nullptr;

            std::array<std::shared_ptr<Texture2D>, max_texture_slots>
                texture_slots;
            uint32_t texture_slot_index = 1; // 0 = white texture

            glm::vec4 quad_positions[4];
        };

        std::unique_ptr<Data> data_;
    }

    void Renderer2D::init()
    {
        data_ = std::make_unique<Data>();

        RenderCommand::init();

        auto va = VertexArray::create();
        auto vb = VertexBuffer::create(data_->max_vertices * sizeof(Vertex));
        vb->set_layout({
            { ShaderDataType::Float3, "a_position" },
            { ShaderDataType::Float4, "a_color" },
            { ShaderDataType::Float2, "a_uv" },
            { ShaderDataType::Float, "a_texture_idx" },
        });
        va->add_vertex_buffer(vb);
        data_->va = va;
        data_->vb = vb;

        // create a buffer of vertices to write too
        data_->vertex_buffer_base = new Vertex[data_->max_vertices];

        // populate an indices buffer with the quad indices
        uint32_t* indices = new uint32_t[data_->max_indices];
        uint32_t offset = 0;
        for (uint32_t i = 0; i < data_->max_indices; i += 6) {
            indices[i + 0] = offset + 0;
            indices[i + 1] = offset + 1;
            indices[i + 2] = offset + 2;

            indices[i + 3] = offset + 2;
            indices[i + 4] = offset + 3;
            indices[i + 5] = offset + 0;

            offset += 4;
        }

        auto ib =
            IndexBuffer::create(indices, data_->max_indices * sizeof(uint32_t));
        va->set_index_buffer(ib);
        delete[] indices;

        auto white_texture = Texture2D::create(1, 1);
        uint32_t texture_data = 0xffffffff;
        white_texture->set_data(&texture_data, sizeof(uint32_t));
        data_->white_texture = white_texture;
        data_->texture_slots[0] = white_texture;

        int32_t samplers[data_->max_texture_slots];
        for (uint32_t i = 0; i < data_->max_texture_slots; i++)
            samplers[i] = i;

        auto shader = Shader::from_file("assets/shaders/basic_texture.glsl");
        shader->set_uniform_int_array(
            "u_textures", samplers, data_->max_texture_slots);
        data_->shader = shader;

        data_->quad_positions[0] = { -0.5f, -0.5f, 0.0f, 1.0f };
        data_->quad_positions[1] = { 0.5f, -0.5f, 0.0f, 1.0f };
        data_->quad_positions[2] = { 0.5f, 0.5f, 0.0f, 1.0f };
        data_->quad_positions[3] = { -0.5f, 0.5f, 0.0f, 1.0f };
    }
    void Renderer2D::shutdown()
    {
        delete[] data_->vertex_buffer_base;
        data_ = nullptr;
    }

    void Renderer2D::resize(uint32_t width, uint32_t height)
    {
        RenderCommand::set_viewport(0, 0, width, height);
    }

    void Renderer2D::begin(const OrthographicCamera2D& camera)
    {
        auto& shader = data_->shader;
        shader->bind();
        shader->set_uniform_mat4("u_view_projection", camera.view_projection());

        start_batch();
    }
    void Renderer2D::end() { flush(); }

    void Renderer2D::start_batch()
    {
        data_->index_count = 0;
        data_->vertex_buffer_ptr = data_->vertex_buffer_base;
        data_->texture_slot_index = 1;
    }
    void Renderer2D::next_batch()
    {
        flush();
        start_batch();
    }

    void Renderer2D::flush()
    {
        if (data_->index_count == 0) {
            return;
        }

        uint32_t size = (uint32_t)((uint8_t*)data_->vertex_buffer_ptr -
                                   (uint8_t*)data_->vertex_buffer_base);
        data_->vb->set_data(data_->vertex_buffer_base, size);

        for (uint32_t i = 0; i < data_->texture_slot_index; i++) {
            data_->texture_slots[i]->bind(i);
        }

        RenderCommand::draw_indexed(
            RenderMode::Triangles, data_->va, data_->index_count);
    }

    void Renderer2D::draw_quad(const glm::mat4& transform,
                               const glm::vec4& color)
    {
        static const size_t vertex_count = 4;
        static const float texture_idx = 0.0f;
        static const glm::vec2 texture_coords[] = {
            { 0.0f, 0.0f }, { 1.0f, 0.0f }, { 1.0f, 1.0f }, { 0.0f, 1.0f }
        };

        if (data_->index_count >= data_->max_indices) {
            next_batch();
        }

        for (size_t i = 0; i < vertex_count; i++) {
            Vertex* vertex = data_->vertex_buffer_ptr;
            vertex->position = transform * data_->quad_positions[i];
            vertex->color = color;
            vertex->texture_idx = texture_idx;
            vertex->uv = texture_coords[i];

            data_->vertex_buffer_ptr++;
        }

        data_->index_count += 6;
    }

    void Renderer2D::draw_quad(const glm::mat4& transform,
                               const std::shared_ptr<Texture2D>& texture,
                               const glm::vec4& color)
    {
        static const size_t vertex_count = 4;
        static const glm::vec2 texture_coords[] = {
            { 0.0f, 0.0f }, { 1.0f, 0.0f }, { 1.0f, 1.0f }, { 0.0f, 1.0f }
        };

        if (data_->index_count > data_->max_indices) {
            next_batch();
        }

        float texture_idx = 0.0f;
        for (size_t i = 0; i < data_->texture_slot_index; i++) {
            if (data_->texture_slots[i] == texture) {
                texture_idx = (float)i;
                break;
            }
        }

        if (texture_idx == 0) {
            if (data_->texture_slot_index >= data_->max_texture_slots) {
                next_batch();
            }

            texture_idx = (float)data_->texture_slot_index;
            data_->texture_slots[data_->texture_slot_index] = texture;
            data_->texture_slot_index++;
        }

        for (size_t i = 0; i < vertex_count; i++) {
            Vertex* vertex = data_->vertex_buffer_ptr;
            vertex->position = transform * data_->quad_positions[i];
            vertex->color = color;
            vertex->texture_idx = texture_idx;
            vertex->uv = texture_coords[i];

            data_->vertex_buffer_ptr++;
        }

        data_->index_count += 6;
    }
}
}
