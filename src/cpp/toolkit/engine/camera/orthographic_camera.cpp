#include "orthographic_camera.h"

#include <glm/gtc/matrix_transform.hpp>

namespace tk {
namespace engine {
    OrthographicCamera::OrthographicCamera()
        : view_(1.0f)
        , projection_(1.0f)
    {}

    OrthographicCamera::OrthographicCamera(float left,
                                           float right,
                                           float bottom,
                                           float top,
                                           float near,
                                           float far)
        : view_(1.0f)
        , projection_(glm::ortho(left, right, bottom, top, near, far))
    {
        view_projection_ = projection_ * view_;
    }

    void OrthographicCamera::set_position(const glm::vec3& position)
    {
        position_ = position;
        recalculate();
    }

    void OrthographicCamera::set_rotation(float radians)
    {
        rotation_ = radians;
        recalculate();
    }

    void OrthographicCamera::recalculate()
    {
        glm::mat4 transform = glm::translate(glm::mat4(1.0f), position_);
        transform = glm::rotate(transform, rotation_, { 0.0f, 0.0f, 1.0f });

        view_ = glm::inverse(transform);
        view_projection_ = projection_ * view_;
    }

    void OrthographicCamera::look_at(const glm::vec3& position,
                                     const glm::vec3& target,
                                     const glm::vec3& up)
    {
        view_ = glm::lookAt(position, target, up);
        view_projection_ = projection_ * view_;
    }

    void OrthographicCamera::set_projection(float left,
                                            float right,
                                            float bottom,
                                            float top,
                                            float near,
                                            float far)
    {
        projection_ = glm::ortho(left, right, bottom, top, near, far);
        view_projection_ = projection_ * view_;
    }
}
}
