#include "index_buffer.h"

#include <glad/glad.h>

namespace tk {
namespace engine {

    IndexBuffer::IndexBuffer(void* indices, size_t size)
        : size_(size)
        , count_(size / sizeof(uint32_t))
    {
        glGenBuffers(1, &renderer_id_);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, renderer_id_);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, size, indices, GL_STATIC_DRAW);
    }
    IndexBuffer::~IndexBuffer() { glDeleteBuffers(1, &renderer_id_); }

    void IndexBuffer::bind() const
    {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, renderer_id_);
    }

    void IndexBuffer::unbind() const
    {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    }

    void IndexBuffer::set_indices(void* indices, size_t size)
    {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, renderer_id_);

        if (size_ < size) {
            glBufferData(
                GL_ELEMENT_ARRAY_BUFFER, size, indices, GL_STATIC_DRAW);
        } else {
            glBufferSubData(GL_ELEMENT_ARRAY_BUFFER, 0, size, indices);
        }

        size_ = size;
        count_ = size / sizeof(uint32_t);
    }
}
}
