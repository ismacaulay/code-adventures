#pragma once
#include <functional>
#include <memory>

namespace tk {
namespace engine {
    struct WindowProps;
    class Event;

    class Window
    {
    public:
        explicit Window(const WindowProps& props);
        ~Window();

        bool should_close();
        void update();

        void set_event_callback(std::function<void(const Event&)> callback);

        void* native_window() const;

    private:
        class Impl;
        std::unique_ptr<Impl> p_;
    };
}
}
