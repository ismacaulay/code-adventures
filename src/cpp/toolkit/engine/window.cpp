#include "window.h"

// must be first!
#include <glad/glad.h>

#include <GLFW/glfw3.h>

#include "logger/assert.h"
#include "logger/log.h"

namespace tk {
namespace engine {
    class Window::Impl
    {
    public:
        Impl()
        {
            int success = glfwInit();
            CAT_ASSERTM(success, "Failed to initialize glfw");

            glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
            glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
            glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
#ifdef __APPLE__
            glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

            window_ = glfwCreateWindow(
                800, 400, "[code-adventures] hello window", NULL, NULL);
            CAT_ASSERTM(window_, "Failed to create window");

            glfwMakeContextCurrent(window_);
            int status = gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);
            CAT_ASSERTM(status, "Failed to load glad");

            CAT_LOG_INFO("OpenGL Info:");
            CAT_LOG_INFO("  Vender: {}", glGetString(GL_VENDOR));
            CAT_LOG_INFO("  Renderer: {}", glGetString(GL_RENDERER));
            CAT_LOG_INFO("  Version: {}", glGetString(GL_VERSION));
        }

        ~Impl()
        {
            glfwDestroyWindow(window_);
            glfwTerminate();
        }

        void update()
        {
            glfwPollEvents();
            glfwSwapBuffers(window_);
        }

        GLFWwindow* window_;
    };

    Window::Window()
        : p_(std::make_unique<Impl>())
    {}
    Window::~Window() {}

    void Window::update() { p_->update(); }

}
}
