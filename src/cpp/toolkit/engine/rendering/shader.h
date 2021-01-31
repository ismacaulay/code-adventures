#pragma once
#include <glad/glad.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <unordered_map>

namespace tk {
namespace engine {

    class Shader
    {
    public:
        explicit Shader(const std::string& vertex_src,
                        const std::string& fragment_src);
        ~Shader();

        void bind() const;
        void unbind() const;

        void set_uniform_int(const std::string& name, int value);

        void set_uniform_float(const std::string& name, float value);
        void set_uniform_vec3(const std::string& name, const glm::vec3& vec);
        void set_uniform_vec4(const std::string& name, const glm::vec4& vec);

        void set_uniform_mat4(const std::string& name, const glm::mat4& matrix);
        void set_uniform_int_array(const std::string& name,
                                   int* data,
                                   size_t size);

        static std::shared_ptr<Shader> from_file(const std::string& path);
        static std::shared_ptr<Shader> from_file(const std::string& vertex,
                                                 const std::string& fragment);
        static std::shared_ptr<Shader> from_source(
            const std::string& vertex_src,
            const std::string& fragment_src);

    private:
        uint32_t create_shader(const std::string& vertex_src,
                               const std::string& fragment_src);
        uint32_t compile(uint32_t type, const std::string& source);

        GLint get_location(const std::string& name);

    private:
        uint32_t renderer_id_;
        std::unordered_map<std::string, GLint> uniform_locations_;
    };
}
}
