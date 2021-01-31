#include "render_command.h"

#include "opengl_renderer.h"

namespace tk {
namespace engine {

    std::unique_ptr<OpenGLRenderer> RenderCommand::renderer_ =
        std::make_unique<OpenGLRenderer>();

    void RenderCommand::init() { renderer_->init(); }

    void RenderCommand::set_clear_color(const glm::vec4& color)
    {
        renderer_->set_clear_color(color);
    }

    void RenderCommand::set_viewport(uint32_t x,
                                     uint32_t y,
                                     uint32_t width,
                                     uint32_t height)
    {
        renderer_->set_viewport(x, y, width, height);
    }

    void RenderCommand::set_fill_mode(FillMode mode)
    {
        renderer_->set_fill_mode(mode);
    }

    void RenderCommand::enable_depth_test(bool enable)
    {
        renderer_->enable_depth_test(enable);
    }

    void RenderCommand::set_depth_func(DepthFunc func)
    {
        renderer_->set_depth_func(func);
    }

    void RenderCommand::clear() { renderer_->clear(); }

    void RenderCommand::draw_array(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array)
    {
        renderer_->draw_array(mode, vertex_array);
    }

    void RenderCommand::draw_indexed(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array,
        size_t count)
    {
        renderer_->draw_indexed(mode, vertex_array, count);
    }
}
}
