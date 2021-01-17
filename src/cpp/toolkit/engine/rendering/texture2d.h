#pragma once
#include <cstdint>
#include <string>
#include <memory>

namespace tk {
namespace engine {

    class Texture2D
    {
    public:
        explicit Texture2D(const std::string& path);
        ~Texture2D();

        uint32_t width() const { return width_; }
        uint32_t height() const { return height_; }

        void bind(uint32_t slot = 0);

        static std::shared_ptr<Texture2D> create(const std::string& path);
    private:
        uint32_t width_, height_;
        uint32_t renderer_id_;
    };

}
}
