#pragma once
#include <glm/glm.hpp>
#include <memory>

namespace tk {
namespace engine {
    class Event;
    class MouseScrollEvent;
    class OrthographicCamera2D;
    class WindowResizeEvent;

    class CameraController2D
    {
    public:
        explicit CameraController2D(
            const std::shared_ptr<OrthographicCamera2D>& camera,
            float aspect_ratio);
        ~CameraController2D() = default;

        const OrthographicCamera2D& camera() const;

        void update(float delta);
        bool on_event(const Event& event);

    private:
        bool process_mouse_scroll_event(const MouseScrollEvent& event);
        bool process_window_resize_event(const WindowResizeEvent& event);

    private:
        std::shared_ptr<OrthographicCamera2D> camera_;
    };
}
}
