#include "engine.h"

#include "window.h"

#include <cstdio>

namespace tk {
namespace engine {

    class Engine::Impl
    {
    public:
        Impl()
            : window_(std::make_shared<Window>())
        {}
        ~Impl() = default;

        void run()
        {
            running_ = true;

            while (running_) {
                window_->update();
            }
        }

        bool running_ = false;
        std::shared_ptr<Window> window_;
    };

    Engine::Engine()
        : p_(std::make_shared<Impl>())
    {}

    void Engine::run() { p_->run(); }
}
}
