#include "toolkit/engine.h"

#include "hello_triangle.h"
#include "shaders.h"

static tk::engine::WindowProps WINDOW_PROPS =
    tk::engine::WindowProps{ "ca: learn-opengl", 1280, 720 };

int main()
{
    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    // auto tutorial_layer = std::make_shared<HelloTriangle>();
    auto tutorial_layer = std::make_shared<Shaders>();

    auto engine = std::make_shared<tk::engine::Engine>(WINDOW_PROPS);
    engine->push_layer(tutorial_layer);

    engine->run();

    engine->shutdown();
    tutorial_layer = nullptr;

    return 0;
}
