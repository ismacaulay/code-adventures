#include <_types/_uint32_t.h>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <stdio.h>
#include <unordered_map>
#include <vector>

#include <assimp/Importer.hpp>
#include <assimp/mesh.h>
#include <assimp/scene.h>
#include <meshoptimizer.h>

static const char* model = "../../public/models/bunny.obj";

struct sphere
{
    float centre[3];
    float radius;

    sphere(float c[3], float r)
    {
        centre[0] = c[0];
        centre[1] = c[1];
        centre[2] = c[2];
        radius = r;
    }
};

template <typename T>
void write_binary(const std::string& path, const std::vector<T>& data)
{
    std::ofstream out(path, std::ios::out | std::ios::binary);
    out.write((char*)data.data(), data.size() * sizeof(T));
    out.close();
}

int main()
{

    std::vector<float> vertices;
    std::vector<uint32_t> indices;
    {
        Assimp::Importer importer;

        const aiScene* scene = importer.ReadFile(model, 0);
        if (scene == nullptr) {
            printf("Failed to load model: %s\n", model);
            std::exit(1);
        }

        printf("Loaded %d meshes\n", scene->mNumMeshes);
        assert(scene->mNumMeshes == 1);

        const aiMesh* mesh = scene->mMeshes[0];
        printf("Vertices: %d, Triangles: %d\n",
               mesh->mNumVertices,
               mesh->mNumFaces);

        indices.resize(3 * mesh->mNumFaces);
        for (int i = 0; i < mesh->mNumFaces; ++i) {
            const aiFace& face = mesh->mFaces[i];
            assert(face.mNumIndices == 3);

            indices[i * 3] = face.mIndices[0];
            indices[i * 3 + 1] = face.mIndices[1];
            indices[i * 3 + 2] = face.mIndices[2];
        }

        vertices.resize(3 * mesh->mNumVertices);
        // memcpy(vertices.data(),
        //        mesh->mVertices,
        //        mesh->mNumVertices * sizeof(aiVector3D));
        for (int i = 0; i < mesh->mNumVertices; ++i) {
            const aiVector3D& v = mesh->mVertices[i];
            // if (i % 1000 == 0) {
            //     printf("x: %f, y: %f, z: %f\n", v.x, v.y, v.z);
            // }

            vertices[i * 3] = v.x;
            vertices[i * 3 + 1] = v.y;
            vertices[i * 3 + 2] = v.z;
        }
    }

    const size_t max_vertices = 255;
    const size_t max_triangles = 128;
    const float cone_weight = 0.0f;

    size_t max_meshlets =
        meshopt_buildMeshletsBound(indices.size(), max_vertices, max_triangles);
    std::vector<meshopt_Meshlet> meshlets(max_meshlets);
    std::vector<unsigned int> meshlet_vertices(max_meshlets * max_vertices);
    std::vector<unsigned char> meshlet_triangles(max_meshlets * max_triangles *
                                                 3);

    size_t meshlet_count = meshopt_buildMeshlets(meshlets.data(),
                                                 meshlet_vertices.data(),
                                                 meshlet_triangles.data(),
                                                 indices.data(),
                                                 indices.size(),
                                                 vertices.data(),
                                                 vertices.size(),
                                                 3 * sizeof(float),
                                                 max_vertices,
                                                 max_triangles,
                                                 cone_weight);

    printf("Generated %d meshlets\n", (int)meshlet_count);

    // const meshopt_Meshlet& m = meshlets[0];

    // TODO: write meshlet info to disk and load in JS
    //
    std::vector<float> o_vertices;
    std::vector<uint32_t> o_triangles;
    std::vector<uint32_t> o_colours;
    std::vector<sphere> o_bounds;
    o_bounds.reserve(meshlet_count);
    std::vector<uint32_t> o_counts;

    std::srand(42);

    uint32_t total_tris = 0;
    for (int i = 0; i < meshlet_count; ++i) {
        const meshopt_Meshlet& m = meshlets[i];
        total_tris += m.triangle_count;
        const unsigned int* m_vertices = &meshlet_vertices[m.vertex_offset];
        const unsigned char* m_triangles =
            &meshlet_triangles[m.triangle_offset];

        uint32_t c = 0;
        c |= (std::rand() % 256);
        c |= ((std::rand() % 256) << 8);
        c |= ((std::rand() % 256) << 16);
        c |= (255 << 24);

        meshopt_Bounds bounds =
            meshopt_computeMeshletBounds(&meshlet_vertices[m.vertex_offset],
                                         &meshlet_triangles[m.triangle_offset],
                                         m.triangle_count,
                                         vertices.data(),
                                         vertices.size(),
                                         3 * sizeof(float));
        o_bounds.push_back({ bounds.center, bounds.radius });

        std::unordered_map<uint32_t, uint32_t> vertex_mapping;
        uint32_t triangle_offset = o_triangles.size() / 3;
        uint32_t vertex_offset = o_vertices.size() / 3;

        for (int t = 0; t < m.triangle_count * 3; ++t) {
            uint32_t idx = m_vertices[m_triangles[t]];
            auto it = vertex_mapping.find(idx);
            if (it != vertex_mapping.end()) {
                o_triangles.push_back(it->second);
                continue;
            }
            assert(idx < vertices.size());

            uint32_t vidx = o_vertices.size() / 3;
            vertex_mapping.insert({ idx, vidx });

            float* v = &vertices[idx * 3];
            o_vertices.insert(o_vertices.end(), { v[0], v[1], v[2] });
            o_colours.push_back(c);
            o_triangles.push_back(vidx);
        }

        uint32_t triangle_count = m.triangle_count;
        uint32_t vertex_count = (o_vertices.size() / 3) - vertex_offset;

        o_counts.insert(
            o_counts.end(),
            { triangle_offset, triangle_count, vertex_offset, vertex_count });
    }

    printf("Average tris per meshlet: %u\n",
           (uint32_t)(total_tris / meshlet_count));

    write_binary("../../public/generated/bunny/vertices.bin", o_vertices);
    write_binary("../../public/generated/bunny/triangles.bin", o_triangles);
    write_binary("../../public/generated/bunny/colours.bin", o_colours);
    write_binary("../../public/generated/bunny/bounds.bin", o_bounds);
    write_binary("../../public/generated/bunny/counts.bin", o_counts);

    return 0;
}
