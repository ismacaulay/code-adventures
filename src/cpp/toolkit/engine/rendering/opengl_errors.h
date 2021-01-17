#pragma once

#include <glad/glad.h>

#include "logger/assert.h"

namespace tk {
namespace engine {

    static void glClearError()
    {
        while (glGetError() != GL_NO_ERROR)
            ;
    }

    static bool glLogCall(const char* function, const char* file, int line)
    {
        GLenum err = glGetError();
        if (err != GL_NO_ERROR) {
            CAT_LOG_ERROR(
                "[opengl error] {0}::{1}::{2}: {3}", file, function, line, err);
            return false;
        }
        return true;
    }

// TODO: disable in release
#define GL_CALL(x)                                                             \
    glClearError();                                                            \
    x;                                                                         \
    CAT_ASSERT(glLogCall(#x, __FILE__, __LINE__))

}
}
