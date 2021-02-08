#include "model_loader.h"

#include <assimp/Importer.hpp>
#include <assimp/postprocess.h>
#include <assimp/scene.h>

#include "engine/rendering/texture2d.h"
#include "geometry/geometry.h"
#include "logger/assert.h"
#include "mesh.h"
#include "model.h"

namespace tk {
namespace engine {

    void process_mesh(aiMesh* mesh,
                      const aiScene* scene,
                      Model* model,
                      const std::string& directory)
    {
        std::vector<Vertex> vertices;
        vertices.reserve(mesh->mNumVertices);
        CAT_LOG_DEBUG(
            "[process_mesh] {} {}", mesh->mNumVertices, mesh->mNumFaces);

        CAT_LOG_DEBUG("[process_mesh] processing verts");
        for (unsigned int i = 0; i < mesh->mNumVertices; i++) {
            Vertex vertex;
            vertex.position = { mesh->mVertices[i].x,
                                mesh->mVertices[i].y,
                                mesh->mVertices[i].z };

            if (mesh->HasNormals()) {
                vertex.normal = { mesh->mNormals[i].x,
                                  mesh->mNormals[i].y,
                                  mesh->mNormals[i].z };
            }

            if (mesh->HasTextureCoords(0)) {
                vertex.tex_coords = { mesh->mTextureCoords[0][i].x,
                                      mesh->mTextureCoords[0][i].y };
            }

            vertices.push_back(vertex);
        }

        CAT_LOG_DEBUG("[process_mesh] processing faces");
        std::vector<Index> indices;
        indices.reserve(mesh->mNumFaces);
        for (unsigned int i = 0; i < mesh->mNumFaces; i++) {
            CAT_ASSERTM(mesh->mFaces[i].mNumIndices == 3,
                        "Must have 3 indices.");

            indices.push_back({ mesh->mFaces[i].mIndices[0],
                                mesh->mFaces[i].mIndices[1],
                                mesh->mFaces[i].mIndices[2] });
        }

        CAT_LOG_DEBUG("[process_mesh] processing textures");
        std::vector<std::shared_ptr<Texture2D>> textures;
        if (mesh->mMaterialIndex < scene->mNumMaterials) {
            aiMaterial* material = scene->mMaterials[mesh->mMaterialIndex];

            for (unsigned int i = 0;
                 i < material->GetTextureCount(aiTextureType_DIFFUSE);
                 i++) {
                aiString str;
                material->GetTexture(aiTextureType_DIFFUSE, i, &str);

                std::string texture_path = directory + '/' + str.C_Str();
                CAT_LOG_DEBUG(texture_path);
                textures.push_back(Texture2D::create(texture_path));
            }
        }

        auto m = std::make_unique<Mesh>(vertices, indices, textures);
        model->add_mesh(std::move(m));
        CAT_LOG_DEBUG("[process_mesh] done processing");
    }

    void process_mesh(aiMesh* mesh,
                      const aiScene* scene,
                      geometry::MeshGeometry* geometry)
    {
        CAT_LOG_DEBUG(
            "[process_mesh] {} {}", mesh->mNumVertices, mesh->mNumFaces);
        geometry->positions.reserve(mesh->mNumVertices);

        CAT_LOG_DEBUG("[process_mesh] processing verts");
        for (unsigned int i = 0; i < mesh->mNumVertices; i++) {
            Vertex vertex;

            geometry->positions.push_back(mesh->mVertices[i].x);
            geometry->positions.push_back(mesh->mVertices[i].y);
            geometry->positions.push_back(mesh->mVertices[i].z);
        }

        geometry->indices.reserve(mesh->mNumFaces);
        for (unsigned int i = 0; i < mesh->mNumFaces; i++) {
            CAT_ASSERTM(mesh->mFaces[i].mNumIndices == 3,
                        "Must have 3 indices.");

            geometry->indices.push_back(mesh->mFaces[i].mIndices[0]);
            geometry->indices.push_back(mesh->mFaces[i].mIndices[1]);
            geometry->indices.push_back(mesh->mFaces[i].mIndices[2]);
        }

        CAT_LOG_DEBUG("[process_mesh] done processing");
    }

    void process_node(aiNode* node,
                      const aiScene* scene,
                      Model* model,
                      const std::string& directory)
    {
        for (unsigned int i = 0; i < node->mNumMeshes; i++) {
            aiMesh* mesh = scene->mMeshes[node->mMeshes[i]];
            process_mesh(mesh, scene, model, directory);
        }

        for (unsigned int i = 0; i < node->mNumChildren; i++) {
            process_node(node->mChildren[i], scene, model, directory);
        }
    }

    void process_node(aiNode* node,
                      const aiScene* scene,
                      geometry::MeshGeometry* geometry)
    {
        for (unsigned int i = 0; i < node->mNumMeshes; i++) {
            aiMesh* mesh = scene->mMeshes[node->mMeshes[i]];
            process_mesh(mesh, scene, geometry);
        }

        for (unsigned int i = 0; i < node->mNumChildren; i++) {
            process_node(node->mChildren[i], scene, geometry);
        }
    }

    std::unique_ptr<Model> ModelLoader::load(const std::string& path)
    {

        Assimp::Importer importer;
        const aiScene* scene = importer.ReadFile(path, 0);
        CAT_ASSERTM(scene && !(scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE) &&
                        scene->mRootNode,
                    importer.GetErrorString());
        CAT_LOG_DEBUG("Loaded scene for path {}", path);

        // TODO: This is bad news bears. Need a way to properly handle the file
        // system
        auto model = std::make_unique<Model>();
        std::string directory = path.substr(0, path.find_last_of('/'));
        process_node(scene->mRootNode, scene, model.get(), directory);
        return std::move(model);
    }

    std::shared_ptr<geometry::MeshGeometry> ModelLoader::load_mesh_geometry(
        const std::string& path)
    {
        Assimp::Importer importer;
        const aiScene* scene = importer.ReadFile(path, 0);
        CAT_ASSERTM(scene && !(scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE) &&
                        scene->mRootNode,
                    importer.GetErrorString());
        CAT_LOG_DEBUG("Loaded scene for path {}", path);

        auto mesh = std::make_shared<geometry::MeshGeometry>();
        process_node(scene->mRootNode, scene, mesh.get());
        return mesh;
    }
}
}
