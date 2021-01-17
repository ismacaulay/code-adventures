#include "vertex_buffer.h"

#include <glad/glad.h>

namespace tk {
namespace engine {
    VertexBuffer::VertexBuffer(void* data, size_t size)
        : size_(size)
    {
        glGenBuffers(1, &renderer_id_);
        glBindBuffer(GL_ARRAY_BUFFER, renderer_id_);
        glBufferData(GL_ARRAY_BUFFER, size_, data, GL_STATIC_DRAW);
    }
    VertexBuffer::~VertexBuffer() { glDeleteBuffers(1, &renderer_id_); }

    uint32_t VertexBuffer::size() const { return size_; }
    uint32_t VertexBuffer::num_vertices() const
    {
        return size_ / layout_.stride();
    }

    void VertexBuffer::bind() const
    {
        glBindBuffer(GL_ARRAY_BUFFER, renderer_id_);
    }

    void VertexBuffer::unbind() const { glBindBuffer(GL_ARRAY_BUFFER, 0); }

    const BufferLayout& VertexBuffer::layout() const { return layout_; }

    void VertexBuffer::set_layout(const BufferLayout& layout)
    {
        layout_ = layout;
    }

    // void VertexBuffer::set_data(void* data, size_t size)
    // {
    //     glBindBuffer(GL_ARRAY_BUFFER, renderer_id_);
    //
    //     if (size_ < size) {
    //         glBufferData(GL_ARRAY_BUFFER, size, data, GL_STATIC_DRAW);
    //     } else {
    //         // TODO: could also use a glMapBuffer here?
    //         glBufferSubData(GL_ARRAY_BUFFER, 0, size, data);
    //     }
    //
    //     size_ = size;
    // }

    std::shared_ptr<VertexBuffer> VertexBuffer::create(void* data, size_t size)
    {
        return std::make_shared<VertexBuffer>(data, size);
    }
}
}
