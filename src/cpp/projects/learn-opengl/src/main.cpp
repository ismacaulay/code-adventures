#include "toolkit/engine.h"

#include "assimp_models.h"
#include "basic_lighting.h"
#include "camera.h"
#include "colors.h"
#include "coordinate_systems.h"
#include "depth_testing.h"
#include "framebuffers.h"
#include "hello_triangle.h"
#include "light_casters.h"
#include "lighting_maps.h"
#include "materials.h"
#include "multiple_lights.h"
#include "shaders.h"
#include "textures.h"
#include "transformations.h"

static tk::engine::WindowProps WINDOW_PROPS =
    tk::engine::WindowProps{ "ca: learn-opengl", 1280, 720 };

static std::unordered_map<std::string,
                          std::function<std::shared_ptr<Tutorial>(void)>>
    TUTORIAL_MAP = {
        { "hellotriangle", []() { return std::make_shared<HelloTriangle>(); } },
        { "shaders", []() { return std::make_shared<Shaders>(); } },
        { "textures", []() { return std::make_shared<Textures>(); } },
        { "transformations",
          []() { return std::make_shared<Transformations>(); } },
        { "coordinatesystems",
          []() { return std::make_shared<CoordinateSystems>(); } },
        { "camera", []() { return std::make_shared<Camera>(); } },
        { "colors", []() { return std::make_shared<Colors>(); } },
        { "basiclighting", []() { return std::make_shared<BasicLighting>(); } },
        { "materials", []() { return std::make_shared<Materials>(); } },
        { "lightingmaps", []() { return std::make_shared<LightingMaps>(); } },
        { "lightcasters", []() { return std::make_shared<LightCasters>(); } },
        { "multiplelights",
          []() { return std::make_shared<MultipleLights>(); } },
        { "assimpmodels", []() { return std::make_shared<AssimpModels>(); } },
        { "depthtesting", []() { return std::make_shared<DepthTesting>(); } },
        { "framebuffers", []() { return std::make_shared<Framebuffers>(); } },
    };

int main(int argc, char** argv)
{
    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    std::shared_ptr<Tutorial> tutorial_layer = nullptr;

    CAT_ASSERTM(argc == 3, "Only -t <name> is supported");
    CAT_ASSERTM(std::strcmp(argv[1], "-t") == 0, "Only -t <name> is supported");

    std::string name(argv[2]);
    std::transform(name.begin(), name.end(), name.begin(), [](unsigned char c) {
        return std::tolower(c);
    });

    auto it = TUTORIAL_MAP.find(name);
    CAT_ASSERTM(it != TUTORIAL_MAP.end(), "Unknown tutorial {0}", name);
    tutorial_layer = it->second();

    auto engine = std::make_shared<tk::engine::Engine>(WINDOW_PROPS);
    engine->push_layer(tutorial_layer);

    engine->run();

    engine->shutdown();
    tutorial_layer = nullptr;

    return 0;
}
