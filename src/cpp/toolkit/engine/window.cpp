#include "window.h"

// must be first!
#include <glad/glad.h>

#include <GLFW/glfw3.h>

#include "logger/assert.h"
#include "logger/log.h"
#include "props.h"

namespace tk {
namespace engine {
    void framebuffer_size_callback(GLFWwindow* window, int width, int height)
    {
        glViewport(0, 0, width, height);
    }
    void process_input(GLFWwindow* window)
    {
        if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
            glfwSetWindowShouldClose(window, true);
    }

    class Window::Impl
    {
    public:
        Impl(const WindowProps& props)
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
                props.width, props.height, props.title.c_str(), NULL, NULL);
            CAT_ASSERTM(window_, "Failed to create window");
            glfwSetFramebufferSizeCallback(window_, framebuffer_size_callback);

            glfwMakeContextCurrent(window_);
            success = gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);
            CAT_ASSERTM(success, "Failed to load glad");

            glViewport(0, 0, props.width, props.height);

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
            process_input(window_);

            glfwSwapBuffers(window_);
            glfwPollEvents();
        }

        GLFWwindow* window_;
    };

    Window::Window(const WindowProps& props)
        : p_(std::make_unique<Impl>(props))
    {}
    Window::~Window() {}

    void Window::update() { p_->update(); }

    bool Window::should_close() { return glfwWindowShouldClose(p_->window_); }

    void* Window::native_window() const { return p_->window_; }
}
}
