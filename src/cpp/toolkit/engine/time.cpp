#include "time.h"

#include <GLFW/glfw3.h>

namespace tk {
namespace engine {

    float Time::get_time() { return glfwGetTime(); }

}
}
