#include "free_camera_controller.h"

#include "engine/engine.h"
#include "engine/events/event.h"
#include "engine/events/input.h"
#include "logger/assert.h"
#include "orthographic_camera.h"
#include "perspective_camera.h"

namespace tk {
namespace engine {

    void FreeCameraController::update(float delta)
    {
        CAT_ASSERTM(current_camera_ != CameraType::None, "No camera set");

        if (Input::is_key_pressed(CAT_KEY_W)) {
            position_ += front_ * camera_speed_ * delta;
        }

        if (Input::is_key_pressed(CAT_KEY_S)) {
            position_ -= front_ * camera_speed_ * delta;
        }

        if (Input::is_key_pressed(CAT_KEY_A)) {
            position_ -=
                glm::normalize(glm::cross(front_, up_)) * camera_speed_ * delta;
        }

        if (Input::is_key_pressed(CAT_KEY_D)) {
            position_ +=
                glm::normalize(glm::cross(front_, up_)) * camera_speed_ * delta;
        }

        camera()->look_at(position_, position_ + front_, up_);
    }

    void FreeCameraController::on_event(const Event& event)
    {
        if (event.type() == EventType::MouseMove) {
            const MouseMoveEvent& e = static_cast<const MouseMoveEvent&>(event);

            if (first_move_) {
                last_x_ = e.x();
                last_y_ = e.y();
                first_move_ = false;
            }

            float x_offset = (e.x() - last_x_) * sensitivity_;
            float y_offset = (last_y_ - e.y()) * sensitivity_;
            last_x_ = e.x();
            last_y_ = e.y();

            yaw_ += x_offset;
            pitch_ += y_offset;
            pitch_ = std::min(std::max(-89.0f, pitch_), 89.0f);

            glm::vec3 front;
            front.x = cos(glm::radians(yaw_)) * cos(glm::radians(pitch_));
            front.y = sin(glm::radians(pitch_));
            front.z = sin(glm::radians(yaw_)) * cos(glm::radians(pitch_));
            front_ = front;
        } else if (event.type() == EventType::WindowResize) {
            const WindowResizeEvent& e =
                static_cast<const WindowResizeEvent&>(event);

            if (current_camera_ == CameraType::Perspective) {
                perspective_camera_->set_aspect_ratio(e.width() / e.height());
            }
        } else if (event.type() == EventType::MouseScroll &&
                   current_camera_ == CameraType::Perspective) {
            const MouseScrollEvent& e =
                static_cast<const MouseScrollEvent&>(event);

            float fov = perspective_camera_->fov();
            fov -= e.y_offset();
            if (fov < 1.0f)
                fov = 1.0f;
            if (fov > 45.0f)
                fov = 45.0f;

            perspective_camera_->set_fov(fov);
        }
    }

}
}
