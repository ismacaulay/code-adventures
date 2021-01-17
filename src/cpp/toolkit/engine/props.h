#pragma once

#include <string>

namespace tk {
namespace engine {

    struct WindowProps
    {
        std::string title;
        int width, height;
        bool cursor_enabled;
    };

}
}
