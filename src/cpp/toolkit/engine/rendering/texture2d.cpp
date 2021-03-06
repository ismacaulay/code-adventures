#include "texture2d.h"

#include <glad/glad.h>
#include <stb/stb_image.h>

#include "logger/assert.h"
#include "opengl_errors.h"

namespace tk {
namespace engine {

    Texture2D::Texture2D(uint32_t width, uint32_t height, void* data)
        : width_(width)
        , height_(height)
    {
        GLenum internal_format = GL_RGBA8;
        data_format_ = GL_RGBA;

        glGenTextures(1, &renderer_id_);
        glBindTexture(GL_TEXTURE_2D, renderer_id_);

        glTexImage2D(GL_TEXTURE_2D,
                     0,
                     internal_format,
                     width,
                     height,
                     0,
                     data_format_,
                     GL_UNSIGNED_BYTE,
                     data);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    }

    Texture2D::Texture2D(const std::string& path)
    {
        int width, height, channels;
        stbi_set_flip_vertically_on_load(1);
        stbi_uc* data = stbi_load(path.c_str(), &width, &height, &channels, 0);
        CAT_ASSERTM(data, "Failed to load texture {}", path);
        CAT_LOG_DEBUG("Loaded image {}: w: {}, h: {} c: {}",
                      path,
                      width,
                      height,
                      channels);

        width_ = width;
        height_ = height;

        GLenum internal_format = 0;
        data_format_ = 0;
        if (channels == 4) {
            internal_format = GL_RGBA;
            data_format_ = GL_RGBA;
        } else if (channels == 3) {
            internal_format = GL_RGB8;
            data_format_ = GL_RGB;
        }
        CAT_ASSERTM(internal_format && data_format_, "Format not supported");

        glGenTextures(1, &renderer_id_);
        glBindTexture(GL_TEXTURE_2D, renderer_id_);

        glTexImage2D(GL_TEXTURE_2D,
                     0,
                     internal_format,
                     width_,
                     height_,
                     0,
                     data_format_,
                     GL_UNSIGNED_BYTE,
                     data);
        glGenerateMipmap(GL_TEXTURE_2D);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

        glTexParameteri(
            GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    }
    Texture2D::~Texture2D() { glDeleteTextures(1, &renderer_id_); }

    void Texture2D::bind(uint32_t slot)
    {
        glActiveTexture(GL_TEXTURE0 + slot);
        glBindTexture(GL_TEXTURE_2D, renderer_id_);
    }

    void Texture2D::set_data(void* data, size_t size)
    {
        uint32_t bpp = data_format_ == GL_RGBA ? 4 : 3;
        CAT_ASSERTM(size == width_ * height_ * bpp,
                    "Data must be entire texture!");

        glBindTexture(GL_TEXTURE_2D, renderer_id_);
        glTexSubImage2D(GL_TEXTURE_2D,
                        0,
                        0,
                        0,
                        width_,
                        height_,
                        data_format_,
                        GL_UNSIGNED_BYTE,
                        data);
    }

    std::shared_ptr<Texture2D> Texture2D::create(uint32_t width,
                                                 uint32_t height,
                                                 void* data)
    {
        return std::make_shared<Texture2D>(width, height, data);
    }

    std::shared_ptr<Texture2D> Texture2D::create(const std::string& path)
    {
        return std::make_shared<Texture2D>(path);
    }
}
}
