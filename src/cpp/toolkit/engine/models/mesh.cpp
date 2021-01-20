#include "mesh.h"

#include "engine/rendering/buffer_layout.h"
#include "engine/rendering/index_buffer.h"
#include "engine/rendering/renderer.h"
#include "engine/rendering/shader.h"
#include "engine/rendering/texture2d.h"
#include "engine/rendering/vertex_array.h"
#include "engine/rendering/vertex_buffer.h"

namespace tk {
namespace engine {
    Mesh::Mesh(const std::vector<Vertex>& vertices,
               const std::vector<Index>& indices,
               const std::vector<std::shared_ptr<Texture2D>>& textures)

        : vertices_(vertices)
        , indices_(indices)
        , textures_(textures)
    {
        auto vb = VertexBuffer::create(vertices_.data(),
                                       vertices_.size() * sizeof(Vertex));
        vb->set_layout({
            { ShaderDataType::Float3, "a_position" },
            { ShaderDataType::Float3, "a_normal" },
            { ShaderDataType::Float2, "a_tex_coords" },
        });

        auto ib = IndexBuffer::create(indices_.data(),
                                      indices_.size() * sizeof(Index));

        va_ = VertexArray::create();
        va_->add_vertex_buffer(vb);
    }

    void Mesh::render(const std::shared_ptr<Shader>& shader)
    {
        for (size_t i = 0; i < textures_.size(); i++) {
            auto& texture = textures_[i];
            texture->bind(i);
            shader->set_uniform_int("u_texture_" + std::to_string(i), i);
        }

        Renderer::submit(shader, va_);
    }
}
}
