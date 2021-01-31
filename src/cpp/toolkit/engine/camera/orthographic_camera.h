#pragma once
#include "camera.h"

#include "logger/assert.h"

namespace tk {
namespace math {
    struct Box;
}

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
        explicit OrthographicCamera(float left,
                                    float right,
                                    float bottom,
                                    float top,
                                    float near,
                                    float far,
                                    float aspect);
        ~OrthographicCamera() = default;

        const glm::mat4& view() const override { return view_; }
        const glm::mat4& projection() const override { return projection_; }
        const glm::mat4& view_projection() const override
        {
            return view_projection_;
        }

        void look_at(const glm::vec3& position,
                     const glm::vec3& target,
                     const glm::vec3& up);

        void set_projection_from_box(const math::Box& box);
        void set_projection(float left,
                            float right,
                            float bottom,
                            float top,
                            float near,
                            float far);

        float zoom() const;
        void set_zoom(float zoom);

        float aspect_ratio() const;
        void set_aspect_ratio(float aspect);

        float width() const;
        float height() const;

    private:
        void update_matrix();

    private:
        glm::mat4 view_;
        glm::mat4 projection_;
        glm::mat4 view_projection_;

        float left_, right_;
        float bottom_, top_;
        float near_, far_;
        float zoom_;
        float aspect_;
    };
}
}
