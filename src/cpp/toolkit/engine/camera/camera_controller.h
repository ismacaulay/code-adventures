#pragma once
#include <glm/glm.hpp>
#include <memory>

namespace tk {
namespace engine {
    class Camera;
    class Event;
    class OrthographicCamera;
    class PerspectiveCamera;

    enum class CameraType
    {
        None = 0,
        Orthographic,
        Perspective
    };
    std::string camera_type_to_string(const CameraType& type);

    class CameraController
    {
    public:
        explicit CameraController() = default;
        virtual ~CameraController() = default;

        virtual Camera* camera();
        virtual const Camera* camera() const;

        void select_camera(CameraType type);
        CameraType selected_camera() const { return current_camera_; }

        void set_orthographic_camera(
            const std::shared_ptr<OrthographicCamera>& camera)
        {
            orthographic_camera_ = camera;
        }
        void set_perspective_camera(
            const std::shared_ptr<PerspectiveCamera>& camera)
        {
            perspective_camera_ = camera;
        }

        virtual void update(float delta){};
        virtual void on_event(const Event& event){};

    protected:
        void look_at(const glm::vec3& position,
                     const glm::vec3& target,
                     const glm::vec3& up);

        CameraType current_camera_ = CameraType::None;

        std::shared_ptr<OrthographicCamera> orthographic_camera_;
        std::shared_ptr<PerspectiveCamera> perspective_camera_;
    };
}
}
