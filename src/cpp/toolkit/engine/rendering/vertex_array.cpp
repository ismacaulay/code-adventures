#include "vertex_array.h"

#include "buffer_layout.h"
#include "index_buffer.h"
#include "vertex_buffer.h"
#include "logger/assert.h"

#include <glad/glad.h>

namespace tk {
namespace engine {
    static GLenum shader_type_to_opengl_type(const ShaderDataType& type)
    {
        switch (type) {
            case ShaderDataType::None:
                return 0;
            case ShaderDataType::Float:
            case ShaderDataType::Float2:
            case ShaderDataType::Float3:
            case ShaderDataType::Float4:
                return GL_FLOAT;
        }

        CAT_ABORT("Unknown ShaderDataType!");
        return 0;
    }

    VertexArray::VertexArray()
        : renderer_id_(0)
        , vertex_buffer_idx_(0)
        , index_buffer_(nullptr)
    {
        glGenVertexArrays(1, &renderer_id_);
    }
    VertexArray::~VertexArray()
    {
        vertex_buffers_.clear();
        index_buffer_ = nullptr;

        glDeleteVertexArrays(1, &renderer_id_);
    }

    void VertexArray::bind() const { glBindVertexArray(renderer_id_); }

    void VertexArray::unbind() const { glBindVertexArray(0); }

    uint32_t VertexArray::num_vertices() const
    {
        uint32_t count = 0;
        for (const auto& buffer : vertex_buffers_) {
            count += buffer->num_vertices();
        }
        return count;
    }

    void VertexArray::add_vertex_buffer(std::shared_ptr<VertexBuffer> buffer)
    {
        const auto& layout = buffer->layout();
        CAT_ASSERTM(layout.elements().size(), "Vertex buffer has no layout");

        glBindVertexArray(renderer_id_);
        buffer->bind();
        for (const auto& element : layout.elements()) {
            glEnableVertexAttribArray(vertex_buffer_idx_);
            glVertexAttribPointer(vertex_buffer_idx_,
                                  element.count,
                                  shader_type_to_opengl_type(element.type),
                                  element.normalized ? GL_TRUE : GL_FALSE,
                                  layout.stride(),
                                  (const void*)element.offset);
            vertex_buffer_idx_++;
        }
        vertex_buffers_.push_back(buffer);
    }

    void VertexArray::set_index_buffer(std::shared_ptr<IndexBuffer> buffer)
    {
        glBindVertexArray(renderer_id_);
        buffer->bind();
        index_buffer_ = buffer;
    }

    const std::shared_ptr<IndexBuffer>& VertexArray::index_buffer() const
    {
        return index_buffer_;
    }

    std::shared_ptr<VertexArray> VertexArray::create()
    {
        return std::make_shared<VertexArray>();
    }
}
}
