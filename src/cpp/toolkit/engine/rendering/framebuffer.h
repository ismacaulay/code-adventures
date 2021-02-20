#pragma once
#include <cstdint>
#include <memory>

namespace tk {
namespace engine {

    class Framebuffer
    {
    public:
        Framebuffer(size_t width, size_t height);
        ~Framebuffer();

        void bind();
        void unbind();

        void bind_texture();

        uint32_t framebuffer_id() const { return framebuffer_id_; }

        static std::shared_ptr<Framebuffer> create(size_t width, size_t height);

    private:
        uint32_t framebuffer_id_;
        uint32_t texture_id_;
        uint32_t renderbuffer_id_;
    };

}
}
