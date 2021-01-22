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
        , rotate_delta_{ 0.0f, 0.0f, 0.0f }
        , pan_delta_(0.0f)
        , position_(0.0f)
        , target_(0.0f)
        , up_(0.0f, 1.0f, 0.0f)
    {}

    void OrbitCameraController::update(float delta)
    {
        glm::vec3 offset = position_ - target_;

        auto spherical = math::to_spherical(offset);

        spherical.r = std::max(0.0f, spherical.r);
        spherical.theta += rotate_delta_.theta;
        spherical.phi = std::max(EPS,
                                 std::min(static_cast<float>(M_PI) - EPS,
                                          spherical.phi + rotate_delta_.phi));

        target_ += pan_delta_;

        offset = math::to_cartesian(spherical);
        position_ = target_ + offset;

        camera()->look_at(position_, target_, up_);

        rotate_delta_ = math::Spherical{ 0.0f, 0.0f, 0.0f };
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
                // rotate based on the mouse delta.
                // a full width/height delta is a distance of 2pi
                rotate_delta_.theta -=
                    2.0f * M_PI * delta.x / static_cast<float>(width_);
                rotate_delta_.phi -=
                    2.0f * M_PI * delta.y / static_cast<float>(height_);
            } else if (state_ == ControlState::Pan) {

                if (current_camera_ == CameraType::Perspective) {
                    glm::vec3 offset = position_ - target_;

                    // compute the distance from the centre to the top of the
                    // screen based on half the fov
                    float target_distance =
                        glm::length(offset) *
                        tan(glm::radians(perspective_camera_->fov()) / 2);

                    const glm::mat4& view = perspective_camera_->view();

                    // 2 * target_distance: the total height based on the fov
                    // right: the right vector of the camera
                    // delta.x / height: the ratio of the distance pan wrt to
                    //                   the height. the height is used here so
                    //                   that it is not distorted by the aspect
                    //                   ratio since the target_distance is
                    //                   based on the vertical fov
                    glm::vec3 right =
                        glm::vec3(view[0][0], view[1][0], view[2][0]);
                    pan_delta_ -= right * 2.0f * target_distance *
                                  (delta.x / static_cast<float>(height_));

                    // up: the up vector of the camera
                    // delta.y / height: the ratio of the distance pan wrt to
                    //                   the height.
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
