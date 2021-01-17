#include "toolkit/engine.h"

#include "camera.h"
#include "coordinate_systems.h"
#include "hello_triangle.h"
#include "shaders.h"
#include "textures.h"
#include "transformations.h"

static tk::engine::WindowProps WINDOW_PROPS =
    tk::engine::WindowProps{ "ca: learn-opengl", 1280, 720 };

int main()
{
    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    // auto tutorial_layer = std::make_shared<HelloTriangle>();
    // auto tutorial_layer = std::make_shared<Shaders>();
    // auto tutorial_layer = std::make_shared<Textures>();
    // auto tutorial_layer = std::make_shared<Transformations>();
    // auto tutorial_layer = std::make_shared<CoordinateSystems>();
    auto tutorial_layer = std::make_shared<Camera>();

    auto engine = std::make_shared<tk::engine::Engine>(WINDOW_PROPS);
    engine->push_layer(tutorial_layer);

    engine->run();

    engine->shutdown();
    tutorial_layer = nullptr;

    return 0;
}
