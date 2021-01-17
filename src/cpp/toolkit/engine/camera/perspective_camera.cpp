#include "perspective_camera.h"

#include "logger/log.h"

#include <glm/gtc/matrix_transform.hpp>

namespace tk {
namespace engine {

    PerspectiveCamera::PerspectiveCamera(float fov,
                                         float aspect,
                                         float near,
                                         float far)
        : fov_(fov)
        , aspect_(aspect)
        , near_(near)
        , far_(far)
        , view_(1.0f)
        , projection_(glm::perspective(glm::radians(fov), aspect, near, far))
    {
        view_projection_ = projection_ * view_;
    }

    void PerspectiveCamera::set_aspect_ratio(float aspect)
    {
        aspect_ = aspect;
        projection_ =
            glm::perspective(glm::radians(fov_), aspect_, near_, far_);
        view_projection_ = projection_ * view_;
    }

    void PerspectiveCamera::set_fov(float fov)
    {
        fov_ = fov;
        projection_ =
            glm::perspective(glm::radians(fov_), aspect_, near_, far_);
        view_projection_ = projection_ * view_;
    }

    void PerspectiveCamera::look_at(const glm::vec3& position,
                                    const glm::vec3& target,
                                    const glm::vec3& up)
    {
        view_ = glm::lookAt(position, target, up);
        view_projection_ = projection_ * view_;
    }
}
}
