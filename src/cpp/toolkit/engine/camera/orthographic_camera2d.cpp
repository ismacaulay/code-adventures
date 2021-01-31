#include "orthographic_camera2d.h"

#include <glm/gtc/matrix_transform.hpp>

namespace tk {
namespace engine {

    OrthographicCamera2D::OrthographicCamera2D(float left,
                                               float right,
                                               float bottom,
                                               float top,
                                               float near,
                                               float far)
        : view_(1.0f)
        , projection_(glm::ortho(left, right, bottom, top, near, far))
    {
        update_view_matrix();
        update_projection_matrix();
    }

    float OrthographicCamera2D::zoom() const { return zoom_; }
    void OrthographicCamera2D::set_zoom(float zoom)
    {
        zoom_ = zoom;
        update_projection_matrix();
    }

    float OrthographicCamera2D::aspect_ratio() const { return aspect_; }
    void OrthographicCamera2D::set_aspect_ratio(float aspect)
    {
        aspect_ = aspect;
        update_projection_matrix();
    }

    void OrthographicCamera2D::set_position(const glm::vec3& position)
    {
        position_ = position;
        update_view_matrix();
    }

    void OrthographicCamera2D::set_rotation(float radians)
    {
        rotation_ = radians;
        update_view_matrix();
    }

    void OrthographicCamera2D::update_view_matrix()
    {
        glm::mat4 transform = glm::translate(glm::mat4(1.0f), position_);
        transform = glm::rotate(transform, rotation_, { 0.0f, 0.0f, 1.0f });

        view_ = glm::inverse(transform);
        view_projection_ = projection_ * view_;
    }

    void OrthographicCamera2D::update_projection_matrix()
    {
        float left = -aspect_ * zoom_;
        float right = aspect_ * zoom_;
        float bottom = -zoom_;
        float top = zoom_;

        projection_ = glm::ortho(left, right, bottom, top, -1.0f, 1.0f);
        view_projection_ = projection_ * view_;
    }
}
}
