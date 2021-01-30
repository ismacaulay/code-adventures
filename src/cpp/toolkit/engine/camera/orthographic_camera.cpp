#include "orthographic_camera.h"

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "math/box.h"

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
        , left_(left)
        , right_(right)
        , bottom_(bottom)
        , top_(top)
        , near_(near)
        , far_(far)
        , zoom_(1.0f)
        , aspect_(1.0f)
    {
        update_matrix();
    }

    OrthographicCamera::OrthographicCamera(float left,
                                           float right,
                                           float bottom,
                                           float top,
                                           float near,
                                           float far,
                                           float aspect)
        : view_(1.0f)
        , left_(left)
        , right_(right)
        , bottom_(bottom)
        , top_(top)
        , near_(near)
        , far_(far)
        , zoom_(1.0f)
        , aspect_(aspect)
    {
        update_matrix();
    }

    void OrthographicCamera::look_at(const glm::vec3& position,
                                     const glm::vec3& target,
                                     const glm::vec3& up)
    {
        view_ = glm::lookAt(position, target, up);
        view_projection_ = projection_ * view_;
    }

    void OrthographicCamera::set_projection_from_box(const math::Box& box)
    {
        float radius = glm::length(box.min - box.max) / 2.0f;

        left_ = -radius;
        right_ = radius;
        bottom_ = -radius;
        top_ = radius;

        update_matrix();
    }

    void OrthographicCamera::set_projection(float left,
                                            float right,
                                            float bottom,
                                            float top,
                                            float near,
                                            float far)
    {
        left_ = left;
        right_ = right;
        bottom_ = bottom;
        top_ = top;
        near_ = near;
        far_ = far;

        update_matrix();
    }

    float OrthographicCamera::zoom() const { return zoom_; }
    void OrthographicCamera::set_zoom(float zoom)
    {
        zoom_ = zoom;
        update_matrix();
    }

    float OrthographicCamera::aspect_ratio() const { return aspect_; }
    void OrthographicCamera::set_aspect_ratio(float aspect)
    {
        aspect_ = aspect;
        update_matrix();
    }

    float OrthographicCamera::width() const { return (right_ - left_); }
    float OrthographicCamera::height() const { return (top_ - bottom_); }

    void OrthographicCamera::update_matrix()
    {
        float dx = (right_ - left_) / (2.0f * zoom_);
        float dy = (top_ - bottom_) / (2.0f * zoom_);
        float cx = (right_ + left_) / 2.0f;
        float cy = (top_ + bottom_) / 2.0f;

        float left = cx - dx;
        float right = cx + dx;
        float top = cy + dy;
        float bottom = cy - dy;

        projection_ = glm::ortho(
            left * aspect_, right * aspect_, bottom, top, near_, far_);
        view_projection_ = projection_ * view_;
    }
}
}
