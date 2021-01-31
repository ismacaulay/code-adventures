#pragma once
#include <glm/glm.hpp>
#include <memory>

#include "defines.h"

namespace tk {
namespace engine {

    class OpenGLRenderer;
    class VertexArray;

    class RenderCommand
    {
    public:
        static void init();

        static void set_clear_color(const glm::vec4& color);
        static void clear();
        static void set_viewport(uint32_t x,
                                 uint32_t y,
                                 uint32_t width,
                                 uint32_t height);

        static void set_fill_mode(FillMode mode);

        static void enable_depth_test(bool enable);
        static void set_depth_func(DepthFunc func);

        static void draw_array(
            RenderMode mode,
            const std::shared_ptr<VertexArray>& vertex_array);
        static void draw_indexed(
            RenderMode mode,
            const std::shared_ptr<VertexArray>& vertex_array,
            size_t count);

    private:
        static std::unique_ptr<OpenGLRenderer> renderer_;
    };
}
}
