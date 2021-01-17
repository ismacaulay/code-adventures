#pragma once
#include "logger/assert.h"

namespace tk {
namespace engine {

    enum class ShaderDataType
    {
        None = 0,
        Float,
        Float2,
        Float3,
        Float4
    };

    static uint32_t get_size_for_type(const ShaderDataType& type)
    {
        switch (type) {
            case ShaderDataType::None:
                return 0;
            case ShaderDataType::Float:
                return 4;
            case ShaderDataType::Float2:
                return 4 * 2;
            case ShaderDataType::Float3:
                return 4 * 3;
            case ShaderDataType::Float4:
                return 4 * 4;
        }

        CAT_ABORT("Unknown ShaderDataType!");
        return 0;
    }

    static uint8_t get_count_for_type(const ShaderDataType& type)
    {
        switch (type) {
            case ShaderDataType::None:
                return 0;
            case ShaderDataType::Float:
                return 1;
            case ShaderDataType::Float2:
                return 2;
            case ShaderDataType::Float3:
                return 3;
            case ShaderDataType::Float4:
                return 4;
        }

        CAT_ABORT("Unknown ShaderDataType!");
        return 0;
    }
}
}
