#pragma once
#include "camera.h"

#include "logger/assert.h"

namespace tk {
namespace engine {

    class OrthographicCamera2D : public Camera
    {
    public:
        explicit OrthographicCamera2D(float left = -1.0f,
                                      float right = 1.0f,
                                      float bottom = -1.0f,
                                      float top = 1.0f,
                                      float near = -1.0f,
                                      float far = 1.0f);
        ~OrthographicCamera2D() = default;

        const glm::mat4& view() const override { return view_; }
        const glm::mat4& projection() const override { return projection_; }
        const glm::mat4& view_projection() const override
        {
            return view_projection_;
        }

        float zoom() const;
        void set_zoom(float zoom);

        float aspect_ratio() const;
        void set_aspect_ratio(float aspect);

        void set_position(const glm::vec3& position);
        const glm::vec3& position() const { return position_; }

        void set_rotation(float radians);
        float rotation() const { return rotation_; }

    private:
        void update_view_matrix();
        void update_projection_matrix();

    private:
        glm::mat4 view_;
        glm::mat4 projection_;
        glm::mat4 view_projection_;

        float zoom_ = 1.0f;
        float aspect_ = 1.0f;
        glm::vec3 position_ = glm::vec3(0.0f);
        float rotation_ = 0.0f;
    };
}
}
