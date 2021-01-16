#pragma once
#include <memory>

namespace tk {
namespace engine {

    class Window
    {
    public:
        explicit Window();
        ~Window();

        void update();

    private:
        class Impl;
        std::unique_ptr<Impl> p_;
    };
}
}
