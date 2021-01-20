#include "model.h"

#include "engine/rendering/shader.h"
#include "mesh.h"

#include <glm/gtc/matrix_transform.hpp>

namespace tk {
namespace engine {
    Model::~Model() {}

    void Model::add_mesh(std::unique_ptr<Mesh> mesh)
    {
        meshes_.push_back(std::move(mesh));
    }

    void Model::render(const std::shared_ptr<Shader>& shader)
    {
        glm::mat4 transform = glm::mat4(1.0f);
        transform = glm::translate(transform, glm::vec3(0.0f, -1.75f, 0.0f));
        transform = glm::scale(transform, { 0.2f, 0.2f, 0.2f });
        shader->set_uniform_mat4("u_model", transform);
        for (auto& mesh : meshes_) {
            mesh->render(shader);
        }
    }
}
}
