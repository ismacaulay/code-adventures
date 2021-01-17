#pragma once
#include "shader_data_type.h"
#include <initializer_list>
#include <string>

namespace tk {
namespace engine {

    struct BufferElement
    {
        ShaderDataType type;
        std::string name;
        uint32_t size;
        size_t offset;
        bool normalized;
        uint8_t count;

        BufferElement() = default;
        BufferElement(ShaderDataType type, const std::string& name)
            : type(type)
            , name(name)
            , size(get_size_for_type(type))
            , offset(0)
            , normalized(false)
            , count(get_count_for_type(type))
        {}
    };

    class BufferLayout
    {
    public:
        explicit BufferLayout() = default;
        BufferLayout(const std::initializer_list<BufferElement>& elements);

        uint32_t stride() const;
        const std::vector<BufferElement>& elements() const;

    private:
        std::vector<BufferElement> elements_;
        uint32_t stride_;
    };
}
}
