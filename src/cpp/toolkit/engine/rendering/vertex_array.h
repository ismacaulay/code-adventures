#pragma once
#include <memory>
#include <vector>

namespace tk {
namespace engine {
    class IndexBuffer;
    class VertexBuffer;

    class VertexArray
    {
    public:
        explicit VertexArray();
        ~VertexArray();

        void bind() const;
        void unbind() const;

        uint32_t num_vertices() const;

        void add_vertex_buffer(std::shared_ptr<VertexBuffer> buffer);

        void set_index_buffer(std::shared_ptr<IndexBuffer> buffer);
        const std::shared_ptr<IndexBuffer>& index_buffer() const;

        static std::shared_ptr<VertexArray> create();
    private:
        uint32_t renderer_id_;
        uint32_t vertex_buffer_idx_;
        std::vector<std::shared_ptr<VertexBuffer>> vertex_buffers_;
        std::shared_ptr<IndexBuffer> index_buffer_;
    };
}
}
