#pragma once
#include "key_codes.h"
#include <memory>

namespace tk {
namespace engine {
    class Window;

    class Input
    {
    public:
        static void init(const Window& window);
        static bool is_key_pressed(int keycode);
    };

}
}
