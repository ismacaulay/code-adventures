#pragma once
#include "buffer_layout.h"

namespace tk {
namespace engine {

    class VertexBuffer
    {
    public:
        explicit VertexBuffer(size_t size);
        explicit VertexBuffer(void* data, size_t size);
        ~VertexBuffer();

        uint32_t size() const;
        uint32_t num_vertices() const;

        void bind() const;
        void unbind() const;

        const BufferLayout& layout() const;
        void set_layout(const BufferLayout& layout);

        void set_data(void* data, size_t size);

        static std::shared_ptr<VertexBuffer> create(size_t size);
        static std::shared_ptr<VertexBuffer> create(void* data, size_t size);

    private:
        uint32_t renderer_id_;
        uint32_t size_;
        BufferLayout layout_;
    };
}
}
