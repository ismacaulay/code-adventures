#include "mesh.h"

#include "defines.h"
#include "engine/rendering/buffer_layout.h"
#include "engine/rendering/index_buffer.h"
#include "engine/rendering/renderer.h"
#include "engine/rendering/shader.h"
#include "engine/rendering/texture2d.h"
#include "engine/rendering/vertex_array.h"
#include "engine/rendering/vertex_buffer.h"
#include "math/box.h"

namespace tk {
namespace engine {
    Mesh::Mesh(const std::vector<Vertex>& vertices,
               const std::vector<Index>& indices,
               const std::vector<std::shared_ptr<Texture2D>>& textures)

        : vertices_(vertices)
        , indices_(indices)
        , textures_(textures)
        , box_(nullptr)
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
    Mesh::~Mesh() {}

    math::Box* Mesh::compute_bounding_box()
    {
        if (vertices_.size() == 0) {
            return nullptr;
        }

        if (box_) {
            return box_.get();
        }

        box_ = std::make_unique<math::Box>();
        glm::vec3 min = { MAX_F32, MAX_F32, MAX_F32 };
        glm::vec3 max = { MIN_F32, MIN_F32, MIN_F32 };
        for (auto& vertex : vertices_) {
            if (vertex.position.x < min.x) {
                min.x = vertex.position.x;
            }
            if (vertex.position.y < min.y) {
                min.y = vertex.position.y;
            }
            if (vertex.position.z < min.z) {
                min.z = vertex.position.z;
            }

            if (vertex.position.x > max.x) {
                max.x = vertex.position.x;
            }
            if (vertex.position.y > max.y) {
                max.y = vertex.position.y;
            }
            if (vertex.position.z > max.z) {
                max.z = vertex.position.z;
            }
        }

        box_->min = min;
        box_->max = max;
        return box_.get();
    }

    void Mesh::render(const std::shared_ptr<Shader>& shader,
                      const glm::mat4& transform)
    {
        for (size_t i = 0; i < textures_.size(); i++) {
            auto& texture = textures_[i];
            texture->bind(i);
            shader->set_uniform_int("u_texture_" + std::to_string(i), i);
        }

        Renderer::submit(shader, va_, transform);
    }
}
}
