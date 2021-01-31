#include "toolkit/engine.h"
#include "toolkit/math.h"
#include "toolkit/noise.h"
#include <glm/glm.hpp>
#include <imgui.h>

using namespace tk::engine;
using namespace tk::noise;

class Noise
    : public Layer
    , public UILayer
{
public:
    OrthographicCamera2D camera_;

    glm::mat4 transform_;
    std::shared_ptr<Texture2D> texture_;

    Noise() = default;
    ~Noise() = default;

    void attach(Engine& engine) override
    {
        const auto& window = engine.window();

        float width = static_cast<float>(window.width());
        float height = static_cast<float>(window.height());
        float aspect_ratio = width / height;

        auto orthographic_camera = std::make_shared<OrthographicCamera2D>();

        camera_.set_aspect_ratio(aspect_ratio);
        camera_.set_zoom(1.0f / aspect_ratio);

        size_t tex_width = 100;
        size_t tex_height = 100;
        uint8_t* tex_data = new uint8_t[tex_width * tex_height * 4];

        float noise_scale = 0.3;
        float* noise =
            generate_perlin_noise(tex_width, tex_height, noise_scale);

        glm::vec3 black(0.0f);
        glm::vec3 white(1.0f);

        int i = 0;
        for (size_t y = 0; y < tex_height; ++y) {
            for (size_t x = 0; x < tex_width; ++x) {
                size_t idx = y * tex_width + x;
                glm::vec3 c = glm::mix(black, white, noise[idx]);
                tex_data[idx * 4 + 0] = std::round(c.r * 255.0);
                tex_data[idx * 4 + 1] = std::round(c.g * 255.0);
                tex_data[idx * 4 + 2] = std::round(c.b * 255.0);
                tex_data[idx * 4 + 3] = 255;
            }
        }

        texture_ = Texture2D::create(tex_width, tex_height, tex_data);

        delete[] noise;
        delete[] tex_data;

        transform_ = glm::mat4(1.0f);
        // transform_ = glm::scale(transform_, { tex_width, tex_height, 1 });
    }

    void detach(Engine& engine) override { texture_ = nullptr; }

    void update(float delta) override
    {
        RenderCommand::set_clear_color({ 0.1f, 0.1f, 0.1f, 1.0f });
        RenderCommand::clear();

        Renderer2D::begin(camera_);

        Renderer2D::draw_quad(transform_, texture_);

        Renderer2D::end();
    }

    bool process_event(const Event& event) override
    {
        if (event.type() == EventType::WindowResize) {
            const auto& e = static_cast<const WindowResizeEvent&>(event);
            float aspect_ratio = (float)e.width() / (float)e.height();
            camera_.set_aspect_ratio(aspect_ratio);
        }

        return false;
    }

    void render() override {}
};

int main()
{
    tk::logger::set_log_level(tk::logger::LogLevel::Debug);

    auto engine_props = EngineProps{ RendererType::Renderer2D };
    auto window_props = WindowProps{ "ca: engine2d", 1280, 720 };

    auto engine = std::make_shared<Engine>(engine_props, window_props);

    auto layer = std::make_shared<Noise>();
    engine->push_layer(layer);
    engine->push_ui_layer(layer);
    engine->run();
    engine->shutdown();

    return 0;
}
