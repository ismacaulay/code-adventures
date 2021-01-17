#include "input.h"

#include <GLFW/glfw3.h>

#include "engine/engine.h"
#include "engine/window.h"
#include "logger/assert.h"

namespace tk {
namespace engine {
    class Impl
    {
    public:
        Impl(const Window& window)
            : window(window)
        {}

        const Window& window;
    };

    static std::unique_ptr<Impl> instance_;

    void Input::init(const Window& window)
    {
        instance_ = std::make_unique<Impl>(window);
    }

    bool Input::is_key_pressed(int keycode)
    {
        CAT_ASSERTM(instance_, "Input instance has not been initialized");

        auto window =
            static_cast<GLFWwindow*>(instance_->window.native_window());
        auto state = glfwGetKey(window, keycode);
        return state == GLFW_PRESS || state == GLFW_REPEAT;
    }

}
}
