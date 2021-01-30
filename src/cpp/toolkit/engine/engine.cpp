#include "engine.h"

#include <vector>

#include "events/event.h"
#include "events/input.h"
#include "frame_time.h"
#include "imgui_renderer.h"
#include "layer.h"
#include "logger/log.h"
#include "rendering/render_command.h"
#include "rendering/renderer.h"
#include "window.h"

namespace tk {
namespace engine {

    class Engine::Impl
    {
    public:
        Impl(const WindowProps& window_props)
            : window_(std::make_shared<Window>(window_props))
        {
            Input::init(*window_);

            window_->set_event_callback(
                std::bind(&Impl::process_event, this, std::placeholders::_1));

            Renderer::init();
            ImGuiRenderer::init(*window_);

            tk::engine::RenderCommand::set_clear_color(
                { 0.1f, 0.1f, 0.1f, 1.0f });
        }
        ~Impl() = default;

        void run()
        {
            running_ = true;

            while (running_) {
                float delta = time_.update();

                if (!minimized_) {
                    tk::engine::RenderCommand::clear();

                    for (auto it = layers_.begin(); it != layers_.end(); ++it) {
                        (*it)->update(delta);
                    }

                    ImGuiRenderer::update();
                }

                window_->update();
            }
        }

        void shutdown()
        {
            ImGuiRenderer::shutdown();
            Renderer::shutdown();
            Input::shutdown();

            window_ = nullptr;
        }

        void process_event(const Event& event)
        {
            if (event.type() == EventType::WindowClose) {
                on_window_close(static_cast<const WindowCloseEvent&>(event));
                return;
            }

            if (event.type() == EventType::WindowResize) {
                on_window_resize(static_cast<const WindowResizeEvent&>(event));
            }

            if (ImGuiRenderer::process_event(event)) {
                return;
            }

            for (auto it = layers_.rbegin(); it != layers_.rend(); it++) {
                if ((*it)->process_event(event)) {
                    break;
                }
            }
        }

        void on_window_close(const WindowCloseEvent& event)
        {
            running_ = false;
        }

        void on_window_resize(const WindowResizeEvent& event)
        {
            if (event.width() == 0 || event.height() == 0) {
                minimized_ = true;
                return;
            }

            Renderer::resize(event.width(), event.height());
        }

        FrameTime time_;
        std::shared_ptr<Window> window_;
        std::vector<std::shared_ptr<Layer>> layers_;
        bool running_ = false;
        bool minimized_ = false;
    };

    Engine::Engine(const WindowProps& window_props)
        : p_(std::make_shared<Impl>(window_props))
    {}

    void Engine::run() { p_->run(); }
    void Engine::shutdown()
    {
        for (const auto& layer : p_->layers_) {
            layer->detach(*this);
        }
        p_->layers_.clear();

        p_->shutdown();
    }
    void Engine::push_layer(std::shared_ptr<Layer> layer)
    {
        p_->layers_.push_back(layer);
        layer->attach(*this);
    }

    void Engine::push_ui_layer(std::shared_ptr<UILayer> layer)
    {
        ImGuiRenderer::push_layer(layer);
    }

    const Window& Engine::window() const { return *p_->window_; }
    Window& Engine::window() { return *p_->window_; }
}
}
