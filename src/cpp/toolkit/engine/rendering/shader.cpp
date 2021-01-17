#include "shader.h"

#include <fstream>
#include <sstream>

#include <glm/gtc/type_ptr.hpp>

#include "logger/assert.h"
#include "opengl_errors.h"

namespace tk {
namespace engine {

    Shader::Shader(const std::string& vertex_src,
                   const std::string& fragment_src)
    {
        renderer_id_ = create_shader(vertex_src, fragment_src);
    }
    Shader::~Shader() { GL_CALL(glDeleteProgram(renderer_id_)); }

    void Shader::bind() const { GL_CALL(glUseProgram(renderer_id_)); }
    void Shader::unbind() const { GL_CALL(glUseProgram(0)); }

    void Shader::set_uniform_int(const std::string& name, int value)
    {
        GLint location = get_location(name);
        glUniform1i(location, value);
    }

    void Shader::set_uniform_float(const std::string& name, float value)
    {
        GLint location = get_location(name);
        glUniform1f(location, value);
    }

    void Shader::set_uniform_vec3(const std::string& name, const glm::vec3& vec)
    {
        GLint location = get_location(name);
        glUniform3fv(location, 1, glm::value_ptr(vec));
    }

    void Shader::set_uniform_vec4(const std::string& name, const glm::vec4& vec)
    {
        GLint location = get_location(name);
        glUniform4fv(location, 1, glm::value_ptr(vec));
    }

    void Shader::set_uniform_mat4(const std::string& name,
                                  const glm::mat4& matrix)
    {
        GLint location = get_location(name);
        glUniformMatrix4fv(location, 1, GL_FALSE, glm::value_ptr(matrix));
    }

    uint32_t Shader::create_shader(const std::string& vertex_src,
                                   const std::string& fragment_src)
    {
        GL_CALL(uint32_t program = glCreateProgram());
        uint32_t vs = compile(GL_VERTEX_SHADER, vertex_src);
        uint32_t fs = compile(GL_FRAGMENT_SHADER, fragment_src);

        GL_CALL(glAttachShader(program, vs));
        GL_CALL(glAttachShader(program, fs));
        GL_CALL(glLinkProgram(program));
        GL_CALL(glValidateProgram(program));

        GL_CALL(glDeleteShader(vs));
        GL_CALL(glDeleteShader(fs));

        return program;
    }

    uint32_t Shader::compile(uint32_t type, const std::string& source)
    {
        GL_CALL(uint32_t id = glCreateShader(type));
        const char* src = source.c_str();
        GL_CALL(glShaderSource(id, 1, &src, nullptr));
        GL_CALL(glCompileShader(id));

        int result;
        GL_CALL(glGetShaderiv(id, GL_COMPILE_STATUS, &result));
        if (result == GL_FALSE) {
            int length;
            GL_CALL(glGetShaderiv(id, GL_INFO_LOG_LENGTH, &length));
            char* message = static_cast<char*>(alloca(length * sizeof(char)));
            GL_CALL(glGetShaderInfoLog(id, length, &length, message));
            GL_CALL(glDeleteShader(id));

            CAT_LOG_ERROR("Failed to compile {} shader",
                          type == GL_VERTEX_SHADER ? "vertex" : "fragment");
            CAT_ABORT(message);

            return 0;
        }

        return id;
    }

    GLint Shader::get_location(const std::string& name)
    {
        auto it = uniform_locations_.find(name);
        if (it != uniform_locations_.end()) {
            return it->second;
        }

        GL_CALL(GLint location =
                    glGetUniformLocation(renderer_id_, name.c_str()));
        uniform_locations_[name] = location;
        return location;
    }

    std::string load_shader(const std::string& path)
    {
        std::ifstream file(path, std::ios::in | std::ios::binary);
        if (!file.is_open()) {
            printf("Error: failed to open file %s\n", path.c_str());
            throw std::runtime_error("Failed to open file");
        }

        std::stringstream ss;
        ss << file.rdbuf();
        file.close();
        return ss.str();
    }

    std::pair<std::string, std::string> process_source(
        const std::string& source)
    {
        const char* vertex_define = "#define VERTEX_SHADER\n";
        const char* fragment_define = "#define FRAGMENT_SHADER\n";

        auto idx = source.find_first_of("#version");
        CAT_ASSERTM(idx != std::string::npos,
                    "Could not find the #version directive");

        auto pos_idx = source.find_first_of("\n", idx);

        std::string vertex_src, fragment_src;

        {
            std::stringstream ss;
            ss << source.substr(0, pos_idx + 1);
            ss << vertex_define;
            ss << source.substr(pos_idx + 1);
            vertex_src = ss.str();
        }

        {
            std::stringstream ss;
            ss << source.substr(0, pos_idx + 1);
            ss << fragment_define;
            ss << source.substr(pos_idx + 1);
            fragment_src = ss.str();
        }

        return { vertex_src, fragment_src };
    }

    std::shared_ptr<Shader> Shader::from_file(const std::string& path)
    {
        std::string src = load_shader(path);
        auto [vertex_src, fragment_src] = process_source(src);
        return std::make_shared<Shader>(vertex_src, fragment_src);
    }

    std::shared_ptr<Shader> Shader::from_file(const std::string& vertex,
                                              const std::string& fragment)
    {
        std::string vertex_src = load_shader(vertex);
        std::string fragment_src = load_shader(fragment);

        return std::make_shared<Shader>(vertex_src, fragment_src);
    }

    std::shared_ptr<Shader> Shader::from_source(const std::string& vertex_src,
                                                const std::string& fragment_src)
    {
        return std::make_shared<Shader>(vertex_src, fragment_src);
    }
}
}
