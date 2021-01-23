#pragma once

#include "camera_controller.h"
#include "math/math.h"

namespace tk {
namespace engine {

    class OrbitCameraController : public CameraController
    {
    public:
        explicit OrbitCameraController(uint32_t width, uint32_t height);
        ~OrbitCameraController() = default;

        void set_position(const glm::vec3& p) { position_ = p; }

        void update(float delta) override;
        void on_event(const Event& event) override;

    private:
        enum ControlState
        {
            None,
            Rotate,
            Pan,
        };

        ControlState state_ = ControlState::None;

        uint32_t width_;
        uint32_t height_;

        glm::vec2 start_;
        math::Spherical rotate_delta_;
        glm::vec3 pan_delta_;
        float dolly_scale_;

        glm::vec3 position_;
        glm::vec3 target_;
        glm::vec3 up_;
    };
}
}
