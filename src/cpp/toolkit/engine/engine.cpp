#include "engine.h"

#include <vector>

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
            Renderer::init();
        }
        ~Impl() = default;

        void run()
        {
            while (!window_->should_close()) {
                for (auto it = layers_.begin(); it != layers_.end(); ++it) {
                    (*it)->update(0.0f);
                }

                window_->update();
            }
        }

        void shutdown()
        {
            CAT_LOG_DEBUG("[engine::shutdown] shutting down");
            for (const auto& layer : layers_) {
                layer->detach();
            }
            layers_.clear();

            Renderer::shutdown();
            CAT_LOG_DEBUG("[engine::shutdown] done");
        }

        std::shared_ptr<Window> window_;
        std::vector<std::shared_ptr<Layer>> layers_;
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
