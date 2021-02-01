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
    NoiseGenerator generator_ = NoiseGenerator(100, 100);
    bool noise_needs_update_ = true;

    glm::mat4 transform_;
    std::shared_ptr<Texture2D> texture_;

    Noise() = default;
    ~Noise() = default;

    glm::vec3 black = glm::vec3(0.0f);
    glm::vec3 white = glm::vec3(1.0f);

    void generate_noise_texture()
    {
        size_t width = generator_.width();
        size_t height = generator_.height();

        uint8_t* tex_data = new uint8_t[width * height * 4];

        float noise_scale = 0.3;
        float* noise = generator_.generate();

        int i = 0;
        for (size_t y = 0; y < height; ++y) {
            for (size_t x = 0; x < width; ++x) {
                size_t idx = y * width + x;
                glm::vec3 c = glm::mix(black, white, noise[idx]);
                tex_data[idx * 4 + 0] = std::round(c.r * 255.0);
                tex_data[idx * 4 + 1] = std::round(c.g * 255.0);
                tex_data[idx * 4 + 2] = std::round(c.b * 255.0);
                tex_data[idx * 4 + 3] = 255;
            }
        }

        texture_->set_data(tex_data, width * height * 4);

        delete[] noise;
        delete[] tex_data;
    }

    void attach(Engine& engine) override
    {
        const auto& window = engine.window();

        float width = static_cast<float>(window.width());
        float height = static_cast<float>(window.height());
        float aspect_ratio = width / height;

        auto orthographic_camera = std::make_shared<OrthographicCamera2D>();

        camera_.set_aspect_ratio(aspect_ratio);
        camera_.set_zoom(1.0f / aspect_ratio);

        texture_ = Texture2D::create(generator_.width(), generator_.height());

        transform_ = glm::mat4(1.0f);
    }

    void detach(Engine& engine) override { texture_ = nullptr; }

    void update(float delta) override
    {
        if (noise_needs_update_) {
            generate_noise_texture();
            noise_needs_update_ = false;
        }

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

    void render() override
    {
        ImGui::Begin("noise settings");

        static float noise_scale = generator_.scale();
        ImGui::DragFloat("scale", &noise_scale, 0.1f, 0.0f, 100.0f);
        if (noise_scale != generator_.scale()) {
            generator_.set_scale(noise_scale);
            noise_needs_update_ = true;
        }

        static int octaves = generator_.octaves();
        ImGui::DragInt("octaves", &octaves, 1, 1, 10);
        if (octaves != generator_.octaves()) {
            generator_.set_octaves(octaves);
            noise_needs_update_ = true;
        }

        static float lacunarity = generator_.lacunarity();
        ImGui::DragFloat("lacunarity", &lacunarity, 0.1, 1.0, 100.0f);
        if (lacunarity != generator_.lacunarity()) {
            generator_.set_lacunarity(lacunarity);
            noise_needs_update_ = true;
        }

        static float persistance = generator_.persistance();
        ImGui::DragFloat("persistance", &persistance, 0.05, 0.0, 1);
        if (persistance != generator_.persistance()) {
            generator_.set_persistance(persistance);
            noise_needs_update_ = true;
        }

        ImGui::End();
    }
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
