#include "framebuffer.h"

#include <glad/glad.h>

#include "logger/assert.h"

namespace tk {
namespace engine {

    Framebuffer::Framebuffer(size_t width, size_t height)
    {
        glGenFramebuffers(1, &framebuffer_id_);
        glBindFramebuffer(GL_FRAMEBUFFER, framebuffer_id_);

        glGenTextures(1, &texture_id_);
        glBindTexture(GL_TEXTURE_2D, texture_id_);
        glTexImage2D(GL_TEXTURE_2D,
                     0,
                     GL_RGB,
                     width,
                     height,
                     0,
                     GL_RGB,
                     GL_UNSIGNED_BYTE,
                     NULL);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glBindTexture(GL_TEXTURE_2D, 0);

        glFramebufferTexture2D(GL_FRAMEBUFFER,
                               GL_COLOR_ATTACHMENT0,
                               GL_TEXTURE_2D,
                               texture_id_,
                               0);

        glGenRenderbuffers(1, &renderbuffer_id_);
        glBindRenderbuffer(GL_RENDERBUFFER, renderbuffer_id_);
        glRenderbufferStorage(
            GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
        glBindRenderbuffer(GL_RENDERBUFFER, 0);

        glFramebufferRenderbuffer(GL_FRAMEBUFFER,
                                  GL_DEPTH_STENCIL_ATTACHMENT,
                                  GL_RENDERBUFFER,
                                  renderbuffer_id_);

        CAT_ASSERTM(glCheckFramebufferStatus(GL_FRAMEBUFFER) ==
                        GL_FRAMEBUFFER_COMPLETE,
                    "framebuffer is incomplete");
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
    Framebuffer::~Framebuffer()
    {
        glDeleteRenderbuffers(1, &renderbuffer_id_);
        glDeleteTextures(1, &texture_id_);
        glDeleteFramebuffers(1, &framebuffer_id_);
    }

    void Framebuffer::bind()
    {
        glBindFramebuffer(GL_FRAMEBUFFER, framebuffer_id_);
    }
    void Framebuffer::unbind() { glBindFramebuffer(GL_FRAMEBUFFER, 0); }

    void Framebuffer::bind_texture()
    {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, texture_id_);
    }

    std::shared_ptr<Framebuffer> Framebuffer::create(size_t width,
                                                     size_t height)
    {
        return std::make_shared<Framebuffer>(width, height);
    }
}
}
