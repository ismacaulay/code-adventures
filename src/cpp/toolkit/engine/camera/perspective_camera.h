#pragma once
#include "camera.h"

namespace tk {
namespace engine {

    class PerspectiveCamera : public Camera
    {
    public:
        explicit PerspectiveCamera(float fov,
                                   float aspect,
                                   float near,
                                   float far);
        ~PerspectiveCamera() = default;

        const glm::mat4& view() const override { return view_; }
        const glm::mat4& projection() const override { return projection_; }
        const glm::mat4& view_projection() const override
        {
            return view_projection_;
        }

        void set_aspect_ratio(float aspect);

        void look_at(const glm::vec3& position,
                     const glm::vec3& target,
                     const glm::vec3& up) override;

        float fov() const override { return fov_; }

    private:
        float fov_;
        float aspect_;
        float near_;
        float far_;

        glm::mat4 view_;
        glm::mat4 projection_;
        glm::mat4 view_projection_;
    };
}
}
