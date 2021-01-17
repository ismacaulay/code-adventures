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

    void OpenGLRenderer::init()
    {
        // glEnable(GL_BLEND);
        // glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        glEnable(GL_DEPTH_TEST);
    }

    void OpenGLRenderer::set_viewport(uint32_t x,
                                      uint32_t y,
                                      uint32_t width,
                                      uint32_t height)
    {
        glViewport(x, y, width, height);
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
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    }

    void OpenGLRenderer::draw_array(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array)
    {
        glDrawArrays(modeToGLMode(mode), 0, vertex_array->num_vertices());
    }

    void OpenGLRenderer::draw_indexed(
        RenderMode mode,
        const std::shared_ptr<VertexArray>& vertex_array)
    {
        glDrawElements(modeToGLMode(mode),
                       vertex_array->index_buffer()->count(),
                       GL_UNSIGNED_INT,
                       nullptr);
    }

}
}
