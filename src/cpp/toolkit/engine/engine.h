#pragma once
#include <memory>

namespace tk {
namespace engine {
    class Layer;
    class Window;
    struct WindowProps;

    class Engine
    {
    public:
        explicit Engine(const WindowProps& window_props);
        virtual ~Engine() = default;

        void run();
        void shutdown();

        void push_layer(std::shared_ptr<Layer> layer);

        const Window& window() const;
        Window& window();

    private:
        class Impl;
        std::shared_ptr<Impl> p_;
    };

}
}
