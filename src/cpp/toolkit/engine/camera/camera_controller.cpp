#include "camera_controller.h"

#include "logger/assert.h"
#include "orthographic_camera.h"
#include "perspective_camera.h"

namespace tk {
namespace engine {

    std::string camera_type_to_string(const CameraType& type)
    {
        switch (type) {
            case CameraType::None:
                return "none";
            case CameraType::Orthographic:
                return "orthographic";
            case CameraType::Perspective:
                return "perspective";
        }

        CAT_ABORT("Unknown camera type: {}", static_cast<int>(type));
        return "";
    }

    Camera* CameraController::camera()
    {
        if (current_camera_ == CameraType::Orthographic) {
            CAT_ASSERT(orthographic_camera_ != nullptr);
            return orthographic_camera_.get();
        }

        if (current_camera_ == CameraType::Perspective) {
            CAT_ASSERT(perspective_camera_ != nullptr);
            return perspective_camera_.get();
        }

        CAT_ABORT("Unknown camera type {}", static_cast<int>(current_camera_));
        return nullptr;
    }

    const Camera* CameraController::camera() const
    {
        return static_cast<const Camera*>(camera());
    }

    void CameraController::select_camera(CameraType type)
    {
        switch (type) {
            case CameraType::Orthographic:
                CAT_ASSERT(orthographic_camera_ != nullptr);
                break;
            case CameraType::Perspective:
                CAT_ASSERT(perspective_camera_ != nullptr);
                break;
            case CameraType::None:
                CAT_ABORT("Camera type cannot be set to none");
                break;
        }

        // TODO: Sync cameras on change
        // if (current_camera_ == CameraType::Orthographic &&
        //     type == CameraType::Perspective) {
        //     perspective_camera_->set_position(orthographic_camera_->position());
        // } else if (current_camera_ == CameraType::Perspective &&
        //            type == CameraType::Orthographic) {
        //     orthographic_camera_->set_position(perspective_camera_->position());
        // }
        current_camera_ = type;
    }
}
}
