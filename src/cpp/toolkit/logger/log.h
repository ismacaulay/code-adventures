#pragma once

#include <spdlog/fmt/ostr.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/spdlog.h>

// #include <glm/glm.hpp>
// #include <glm/gtx/string_cast.hpp>

namespace tk {
namespace logger {

    enum class LogLevel
    {
        Trace = spdlog::level::level_enum::trace,
        Debug = spdlog::level::level_enum::debug,
        Info = spdlog::level::level_enum::info,
        Warn = spdlog::level::level_enum::warn,
        Error = spdlog::level::level_enum::err,
        Critical = spdlog::level::level_enum::critical,
        Off = spdlog::level::level_enum::off,
    };

    static void set_log_level(LogLevel level)
    {
        spdlog::set_level(static_cast<spdlog::level::level_enum>(level));
    }
}
}

#define CAT_LOG_TRACE(...)    spdlog::trace(__VA_ARGS__)
#define CAT_LOG_DEBUG(...)    spdlog::debug(__VA_ARGS__)
#define CAT_LOG_INFO(...)     spdlog::info(__VA_ARGS__)
#define CAT_LOG_WARN(...)     spdlog::warn(__VA_ARGS__)
#define CAT_LOG_ERROR(...)    spdlog::error(__VA_ARGS__)
#define CAT_LOG_CRITICAL(...) spdlog::critical(__VA_ARGS__)

// static inline std::ostream& operator<<(std::ostream& os, const glm::vec3& v)
// {
//     return os << glm::to_string(v);
// }
