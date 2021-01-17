#pragma once
#include "camera.h"

#include "logger/assert.h"

namespace tk {
namespace engine {

    class OrthographicCamera : public Camera
    {
    public:
        explicit OrthographicCamera();
        explicit OrthographicCamera(float left,
                                    float right,
                                    float bottom,
                                    float top,
                                    float near = -1.0f,
                                    float far = 1.0f);
        ~OrthographicCamera() = default;

        const glm::mat4& view() const override { return view_; }
        const glm::mat4& projection() const override { return projection_; }
        const glm::mat4& view_projection() const override
        {
            return view_projection_;
        }

        void look_at(const glm::vec3& position,
                     const glm::vec3& target,
                     const glm::vec3& up) override;

        float fov() const override
        {
            CAT_ABORT("[OrthographicCamera] fov not implemented");
            return 0.0f;
        }

        void set_projection(float left,
                            float right,
                            float bottom,
                            float top,
                            float near = -1.0f,
                            float far = 1.0f);

        void set_position(const glm::vec3& position);
        const glm::vec3& position() const { return position_; }

        void set_rotation(float radians);
        float rotation() const { return rotation_; }

    private:
        void recalculate();

    private:
        glm::mat4 view_;
        glm::mat4 projection_;
        glm::mat4 view_projection_;

        glm::vec3 position_;
        float rotation_;
    };
}
}
