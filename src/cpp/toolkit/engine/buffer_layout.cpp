#include "buffer_layout.h"

namespace tk {
namespace engine {

    BufferLayout::BufferLayout(
        const std::initializer_list<BufferElement>& elements)
        : elements_(elements)
        , stride_(0)
    {
        for (auto& element : elements_) {
            element.offset = stride_;
            stride_ += element.size;
        }
    }

    uint32_t BufferLayout::stride() const { return stride_; }

    const std::vector<BufferElement>& BufferLayout::elements() const
    {
        return elements_;
    }
}
}
