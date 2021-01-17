#pragma once
#include <memory>

namespace tk {
namespace engine {
    struct WindowProps;

    class Window
    {
    public:
        explicit Window(const WindowProps& props);
        ~Window();

        bool should_close();
        void update();

        void* native_window() const;

    private:
        class Impl;
        std::unique_ptr<Impl> p_;
    };
}
}
