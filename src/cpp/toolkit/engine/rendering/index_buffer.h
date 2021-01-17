#pragma once

#include <cstdint>
#include <cstdlib>

namespace tk {
namespace engine {

    class IndexBuffer
    {
    public:
        explicit IndexBuffer(void* indices, size_t size);
        ~IndexBuffer();

        void bind() const;
        void unbind() const;

        uint32_t count() const { return count_; }

        void set_indices(void* indices, size_t size);

    private:
        uint32_t renderer_id_;
        size_t size_;
        uint32_t count_;
    };

}
}
