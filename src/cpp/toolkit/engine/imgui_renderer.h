#pragma once
#include "layer.h"

#include <memory>
#include <vector>

namespace tk {
namespace engine {
    class Window;

    class ImGuiRenderer
    {
    public:
        explicit ImGuiRenderer();
        ~ImGuiRenderer();

        static void init(const Window& window);
        static void shutdown();

        static void update();
        static bool process_event(const Event& event);

        static void push_layer(std::shared_ptr<UILayer> layer);

    private:
        class Impl;
        static std::unique_ptr<Impl> p_;
    };
}
}
