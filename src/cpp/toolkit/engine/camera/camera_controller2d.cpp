#include "camera_controller2d.h"

#include "engine/camera/orthographic_camera2d.h"
#include "engine/events/event.h"
#include "engine/events/input.h"

#include "logger/log.h"

namespace tk {
namespace engine {

    CameraController2D::CameraController2D(
        const std::shared_ptr<OrthographicCamera2D>& camera,
        float aspect_ratio)
        : camera_(camera)
    {
        camera_->set_aspect_ratio(aspect_ratio);
        camera_->set_zoom(1.0f);
        camera_->set_position(glm::vec3(0.0f));
    }

    const OrthographicCamera2D& CameraController2D::camera() const
    {
        return *camera_;
    }

    void CameraController2D::update(float delta)
    {
        float speed = camera_->zoom();
        glm::vec3 position = camera_->position();

        if (Input::is_key_pressed(CAT_KEY_A)) {
            position.x -= speed * delta;
        } else if (Input::is_key_pressed(CAT_KEY_D)) {
            position.x += speed * delta;
        } else if (Input::is_key_pressed(CAT_KEY_W)) {
            position.y += speed * delta;
        } else if (Input::is_key_pressed(CAT_KEY_S)) {
            position.y -= speed * delta;
        }

        camera_->set_position(position);
    }

    bool CameraController2D::on_event(const Event& event)
    {
        if (event.type() == EventType::MouseScroll) {
            return process_mouse_scroll_event(
                static_cast<const MouseScrollEvent&>(event));
        }

        if (event.type() == EventType::WindowResize) {
            return process_window_resize_event(
                static_cast<const WindowResizeEvent&>(event));
        }

        return false;
    }

    bool CameraController2D::process_mouse_scroll_event(
        const MouseScrollEvent& event)
    {
        float zoom = camera_->zoom();
        zoom -= event.y_offset() * 0.25f;
        zoom = std::max(zoom, 0.25f);
        camera_->set_zoom(zoom);

        return false;
    }

    bool CameraController2D::process_window_resize_event(
        const WindowResizeEvent& event)
    {
        float aspect_ratio = (float)event.width() / (float)event.height();
        camera_->set_aspect_ratio(aspect_ratio);
        return false;
    }
}
}
