#pragma once
#include <cstdint>
#include <glm/glm.hpp>
#include <memory>

#include "defines.h"

namespace tk {
namespace engine {
    class VertexArray;

    class OpenGLRenderer
    {
    public:
        explicit OpenGLRenderer() = default;
        ~OpenGLRenderer() = default;

        void init();
        void set_viewport(uint32_t x,
                          uint32_t y,
                          uint32_t width,
                          uint32_t height);

        void enable_depth_test(bool enabled);
        bool depth_test_enabled() const;

        void set_depth_func(DepthFunc func);

        void set_fill_mode(FillMode mode);

        void set_clear_color(const glm::vec4& color);
        void clear();

        void draw_array(RenderMode mode,
                        const std::shared_ptr<VertexArray>& vertex_array);

        void draw_indexed(RenderMode mode,
                          const std::shared_ptr<VertexArray>& vertex_array,
                          size_t count);

    private:
        bool depth_test_enabled_ = false;
    };
}
}
