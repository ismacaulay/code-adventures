#include "model.h"

#include "defines.h"
#include "engine/rendering/shader.h"
#include "math/box.h"
#include "mesh.h"

#include <glm/gtc/matrix_transform.hpp>

namespace tk {
namespace engine {
    Model::Model()
        : box_(std::make_unique<math::Box>())
    {}
    Model::~Model() {}

    void Model::add_mesh(std::unique_ptr<Mesh> mesh)
    {
        meshes_.push_back(std::move(mesh));
        update_bounding_box();
    }

    void Model::render(const std::shared_ptr<Shader>& shader,
                       const glm::mat4& transform)
    {
        glm::mat4 local_transform = glm::mat4(1.0f);
        local_transform = glm::translate(local_transform, -box_->centre());
        local_transform = transform * local_transform;
        for (auto& mesh : meshes_) {
            mesh->render(shader, local_transform);
        }
    }

    void Model::update_bounding_box()
    {
        if (meshes_.size() == 0) {
            return;
        }

        glm::vec3 min = { MAX_F32, MAX_F32, MAX_F32 };
        glm::vec3 max = { MIN_F32, MIN_F32, MIN_F32 };
        for (auto& mesh : meshes_) {
            if (auto mesh_box = mesh->compute_bounding_box()) {
                if (mesh_box->min.x < min.x) {
                    min.x = mesh_box->min.x;
                }
                if (mesh_box->min.y < min.y) {
                    min.y = mesh_box->min.y;
                }
                if (mesh_box->min.z < min.z) {
                    min.z = mesh_box->min.z;
                }

                if (mesh_box->max.x > max.x) {
                    max.x = mesh_box->max.x;
                }
                if (mesh_box->max.y > max.y) {
                    max.y = mesh_box->max.y;
                }
                if (mesh_box->max.z > max.z) {
                    max.z = mesh_box->max.z;
                }
            }
        }

        box_->min = min;
        box_->max = max;
    }
}
}
