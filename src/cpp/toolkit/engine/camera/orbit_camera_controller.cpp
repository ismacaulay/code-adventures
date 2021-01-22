#include "orbit_camera_controller.h"

#include "engine/events/event.h"
#include "logger/log.h"
#include "math/math.h"
#include "perspective_camera.h"

namespace {
static float EPS = 0.000001f;
}

namespace tk {
namespace engine {
    OrbitCameraController::OrbitCameraController(uint32_t width,
                                                 uint32_t height)
        : width_(width)
        , height_(height)
        , start_(0.0f)
        , spherical_delta_(0.0f)
        , pan_delta_(0.0f)
        , position_(0.0f)
        , target_(0.0f)
        , up_(0.0f, 1.0f, 0.0f)
    {}

    void OrbitCameraController::update(float delta)
    {
        glm::vec3 offset = position_ - target_;

        glm::vec3 spherical = math::to_spherical(offset);
        spherical.x = std::max(0.0f, spherical.x);
        spherical.y += spherical_delta_.y;
        spherical.z = std::max(EPS,
                               std::min(static_cast<float>(M_PI) - EPS,
                                        spherical.z + spherical_delta_.z));

        target_ += pan_delta_;

        offset = math::to_cartesian(spherical);
        position_ = target_ + offset;

        camera()->look_at(position_, target_, up_);

        spherical_delta_ = glm::vec3(0.0f);
        pan_delta_ = glm::vec3(0.0f);
    }

    void OrbitCameraController::on_event(const Event& event)
    {
        if (event.type() == EventType::MouseButtonPressed) {
            const auto& e = static_cast<const MouseButtonPressedEvent&>(event);

            if (e.button() == CAT_MOUSE_BUTTON_LEFT) {
                state_ = ControlState::Rotate;
                start_ = glm::vec2(e.x(), e.y());
            } else if (e.button() == CAT_MOUSE_BUTTON_RIGHT) {
                state_ = ControlState::Pan;
                start_ = glm::vec2(e.x(), e.y());
            }

        } else if (event.type() == EventType::MouseButtonReleased) {
            state_ = ControlState::None;
        } else if (event.type() == EventType::MouseMove) {
            const auto& e = static_cast<const MouseMoveEvent&>(event);
            glm::vec2 end(e.x(), e.y());
            glm::vec2 delta = end - start_;

            if (state_ == ControlState::Rotate) {
                spherical_delta_.y -=
                    2.0f * M_PI * delta.x / static_cast<float>(width_);
                spherical_delta_.z -=
                    2.0f * M_PI * delta.y / static_cast<float>(height_);
            } else if (state_ == ControlState::Pan) {

                if (current_camera_ == CameraType::Perspective) {
                    glm::vec3 offset = position_ - target_;
                    float target_distance =
                        glm::length(offset) *
                        tan(glm::radians(perspective_camera_->fov()) / 2);

                    const glm::mat4& view = perspective_camera_->view();

                    glm::vec3 right =
                        glm::vec3(view[0][0], view[1][0], view[2][0]);
                    pan_delta_ -= right * 2.0f * target_distance *
                                  (delta.x / static_cast<float>(height_));

                    glm::vec3 up =
                        glm::vec3(view[0][1], view[1][1], view[2][1]);
                    pan_delta_ += up * 2.0f * target_distance *
                                  (delta.y / static_cast<float>(height_));
                } else if (current_camera_ == CameraType::Orthographic) {
                    CAT_LOG_ERROR("[OrbitCameraController] orthographic camera "
                                  "not supported yet");
                } else {
                    CAT_LOG_ERROR(
                        "[OrbitCameraController] unknown camera type");
                }
            }

            start_ = end;
        } else if (event.type() == EventType::WindowResize) {
            const auto& e = static_cast<const WindowResizeEvent&>(event);
            width_ = e.width();
            height_ = e.height();

            if (current_camera_ == CameraType::Perspective) {
                perspective_camera_->set_aspect_ratio(
                    static_cast<float>(width_) / static_cast<float>(height_));
            }
        }
    }
}
}
