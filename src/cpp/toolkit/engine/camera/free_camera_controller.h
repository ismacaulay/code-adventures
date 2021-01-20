#pragma once
#include "camera_controller.h"

namespace tk {
namespace engine {

    class FreeCameraController : public CameraController
    {
    public:
        explicit FreeCameraController() = default;
        ~FreeCameraController() = default;

        void set_position(const glm::vec3& position) { position_ = position; }
        const glm::vec3& position() const { return position_; }

        const glm::vec3& front() const { return front_; }

        void update(float delta) override;
        void on_event(const Event& event) override;

    private:
        glm::vec3 position_ = { 0.0f, 0.0f, 0.0f };
        glm::vec3 front_ = { 0.0f, 0.0f, -1.0f };
        glm::vec3 up_ = { 0.0f, 1.0f, 0.0f };

        float camera_speed_ = 2.5f;
        float yaw_ = -90.0f;
        float pitch_ = 0.0f;

        float last_x_ = 1280.0f / 2.0f;
        float last_y_ = 720.0f / 2.0f;
        float sensitivity_ = 0.05f;
        bool first_move_ = true;
    };

}
}
