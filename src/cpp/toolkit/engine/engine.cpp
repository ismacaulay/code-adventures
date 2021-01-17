#include "engine.h"

#include <vector>

#include "events/events.h"
#include "layer.h"
#include "logger/log.h"
#include "renderer.h"
#include "window.h"

namespace tk {
namespace engine {

    class Engine::Impl
    {
    public:
        Impl(const WindowProps& window_props)
            : window_(std::make_shared<Window>(window_props))
        {
            window_->set_event_callback(
                std::bind(&Impl::process_event, this, std::placeholders::_1));

            Renderer::init();
        }
        ~Impl() = default;

        void run()
        {
            running_ = true;

            while (running_) {
                if (!minimized_) {
                    for (auto it = layers_.begin(); it != layers_.end(); ++it) {
                        (*it)->update(0.0f);
                    }
                }

                window_->update();
            }
        }

        void shutdown()
        {
            for (const auto& layer : layers_) {
                layer->detach();
            }
            layers_.clear();

            Renderer::shutdown();
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
        std::shared_ptr<Window> window_;
        std::vector<std::shared_ptr<Layer>> layers_;
        bool running_ = false;
        bool minimized_ = false;
    };

    Engine::Engine(const WindowProps& window_props)
        : p_(std::make_shared<Impl>(window_props))
    {}

    void Engine::run() { p_->run(); }
    void Engine::shutdown() { p_->shutdown(); }
    void Engine::push_layer(std::shared_ptr<Layer> layer)
    {
        p_->layers_.push_back(layer);
        layer->attach();
    }
}
}
