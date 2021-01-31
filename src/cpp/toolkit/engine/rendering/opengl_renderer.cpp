#include "opengl_renderer.h"
#include "logger/assert.h"
#include "logger/log.h"

#include <glad/glad.h>

#include "index_buffer.h"
#include "vertex_array.h"

namespace tk {
namespace engine {
    static GLenum modeToGLMode(RenderMode mode)
    {
        switch (mode) {
            case RenderMode::Lines:
                return GL_LINES;
            case RenderMode::Triangles:
                return GL_TRIANGLES;
        }

        CAT_ABORT("Unknown render mode");
        return GL_TRIANGLES;
    }

    static GLenum depthFuncToGLDepthFunc(DepthFunc func)
    {
        switch (func) {
            case DepthFunc::Always:
                return GL_ALWAYS;
            case DepthFunc::Less:
                return GL_LESS;
        }
        return GL_NEVER;
    }

    void OpenGLRenderer::init() { enable_depth_test(true); }

    void OpenGLRenderer::set_viewport(uint32_t x,
                                      uint32_t y,
                                      uint32_t width,
                                      uint32_t height)
    {
        glViewport(x, y, width, height);
    }

    void OpenGLRenderer::enable_depth_test(bool enabled)
    {
        depth_test_enabled_ = enabled;

        if (enabled) {
            glEnable(GL_DEPTH_TEST);
        } else {
            glDisable(GL_DEPTH_TEST);
        }
    }

    bool OpenGLRenderer::depth_test_enabled() const
    {
        return depth_test_enabled_;
    }

    void OpenGLRenderer::set_depth_func(DepthFunc func)
    {
        glDepthFunc(depthFuncToGLDepthFunc(func));
    }

    void OpenGLRenderer::set_fill_mode(FillMode mode)
    {
        glPolygonMode(GL_FRONT_AND_BACK,
                      mode == FillMode::Fill ? GL_FILL : GL_LINE);
    }

    void OpenGLRenderer::set_clear_color(const glm::vec4& color)
    {
        glClearColor(color.r, color.g, color.b, color.a);
    }

    void OpenGLRenderer::clear()
    {
        GLbitfield state = GL_COLOR_BUFFER_BIT;

        if (depth_test_enabled()) {
            state |= GL_DEPTH_BUFFER_BIT;
        }

        glClear(state);
    }

    void OpenGLRenderer::draw_array(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array)
    {
        glDrawArrays(modeToGLMode(mode), 0, vertex_array->num_vertices());
    }

    void OpenGLRenderer::draw_indexed(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array,
        size_t count)
    {
        glDrawElements(modeToGLMode(mode), count, GL_UNSIGNED_INT, nullptr);
    }

}
}
