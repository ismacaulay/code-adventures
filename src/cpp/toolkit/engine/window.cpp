#include "window.h"

// must be first!
#include <glad/glad.h>

#include <GLFW/glfw3.h>

#include "events/event.h"
#include "logger/assert.h"
#include "logger/log.h"
#include "props.h"

namespace tk {
namespace engine {
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

            glfwMakeContextCurrent(window_);
            success = gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);
            CAT_ASSERTM(success, "Failed to load glad");
            CAT_LOG_INFO("OpenGL Info:");
            CAT_LOG_INFO("  Vender: {}", glGetString(GL_VENDOR));
            CAT_LOG_INFO("  Renderer: {}", glGetString(GL_RENDERER));
            CAT_LOG_INFO("  Version: {}", glGetString(GL_VERSION));

            glViewport(0, 0, props.width, props.height);

            glfwSetWindowUserPointer(window_, &data_);

            glfwSetWindowCloseCallback(window_, [](GLFWwindow* window) {
                WindowData* data =
                    (WindowData*)glfwGetWindowUserPointer(window);

                WindowCloseEvent event;
                if (data->event_callback) {
                    data->event_callback(event);
                }
            });

            data_.width = props.width;
            data_.height = props.height;
            glfwSetWindowSizeCallback(
                window_, [](GLFWwindow* window, int width, int height) {
                    WindowData* data =
                        (WindowData*)glfwGetWindowUserPointer(window);
                    data->width = width;
                    data->height = height;

                    if (data->event_callback) {
                        WindowResizeEvent event(width, height);
                        data->event_callback(event);
                    }
                });

            glfwSetKeyCallback(window_,
                               [](GLFWwindow* window,
                                  int key,
                                  int scancode,
                                  int action,
                                  int mods) {
                                   WindowData* data =
                                       (WindowData*)glfwGetWindowUserPointer(
                                           window);
                                   switch (action) {
                                       case GLFW_PRESS: {
                                           KeyPressedEvent event(key, 0);
                                           if (data->event_callback) {
                                               data->event_callback(event);
                                           }
                                           break;
                                       }
                                       case GLFW_RELEASE: {
                                           KeyReleasedEvent event(key);
                                           if (data->event_callback) {
                                               data->event_callback(event);
                                           }
                                           break;
                                       }
                                       case GLFW_REPEAT: {
                                           KeyPressedEvent event(key, 1);
                                           if (data->event_callback) {
                                               data->event_callback(event);
                                           }
                                           break;
                                       }
                                   }
                               });

            glfwSetMouseButtonCallback(
                window_,
                [](GLFWwindow* window, int button, int action, int mods) {
                    WindowData* data =
                        (WindowData*)glfwGetWindowUserPointer(window);

                    double x, y;
                    glfwGetCursorPos(window, &x, &y);
                    switch (action) {
                        case GLFW_PRESS: {
                            MouseButtonPressedEvent event(
                                button,
                                static_cast<float>(x),
                                static_cast<float>(y));
                            if (data->event_callback) {
                                data->event_callback(event);
                            }
                            break;
                        }
                        case GLFW_RELEASE: {
                            MouseButtonReleasedEvent event(
                                button,
                                static_cast<float>(x),
                                static_cast<float>(y));
                            if (data->event_callback) {
                                data->event_callback(event);
                            }
                            break;
                        }
                    }
                });

            glfwSetScrollCallback(
                window_,
                [](GLFWwindow* window, double x_offset, double y_offset) {
                    WindowData* data =
                        (WindowData*)glfwGetWindowUserPointer(window);

                    MouseScrollEvent event(static_cast<float>(x_offset),
                                           static_cast<float>(y_offset));
                    if (data->event_callback) {
                        data->event_callback(event);
                    }
                });

            glfwSetCursorPosCallback(
                window_, [](GLFWwindow* window, double x_pos, double y_pos) {
                    WindowData* data =
                        (WindowData*)glfwGetWindowUserPointer(window);

                    MouseMoveEvent event(static_cast<float>(x_pos),
                                         static_cast<float>(y_pos));

                    if (data->event_callback) {
                        data->event_callback(event);
                    }
                });

            glfwSetErrorCallback([](int code, const char* msg) {
                CAT_LOG_ERROR("GLFW Error ({0}):, {1}", code, msg);
            });
        }

        ~Impl()
        {
            glfwDestroyWindow(window_);
            glfwTerminate();
        }

        void update()
        {
            glfwSwapBuffers(window_);
            glfwPollEvents();
        }

        void set_cursor_enabled(bool enabled)
        {
            cursor_enabled_ = enabled;
            glfwSetInputMode(window_,
                             GLFW_CURSOR,
                             enabled ? GLFW_CURSOR_NORMAL
                                     : GLFW_CURSOR_DISABLED);
        }

        bool cursor_enabled() const { return cursor_enabled_; }

        struct WindowData
        {
            uint32_t width, height;
            std::function<void(const Event&)> event_callback;
        };

        WindowData data_;
        GLFWwindow* window_;
        bool cursor_enabled_;
    };

    Window::Window(const WindowProps& props)
        : p_(std::make_unique<Impl>(props))
    {}
    Window::~Window() {}

    void Window::update() { p_->update(); }

    void Window::set_cursor_enabled(bool enabled)
    {
        p_->set_cursor_enabled(enabled);
    }
    bool Window::cursor_enabled() const { return p_->cursor_enabled(); }

    uint32_t Window::width() const { return p_->data_.width; }
    uint32_t Window::height() const { return p_->data_.height; }
    float Window::aspect() const
    {
        return static_cast<float>(width()) / static_cast<float>(height());
    }

    void Window::set_event_callback(std::function<void(const Event&)> callback)
    {
        p_->data_.event_callback = callback;
    }
    void* Window::native_window() const { return p_->window_; }
}
}
