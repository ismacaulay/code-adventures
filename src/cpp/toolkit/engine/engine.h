#pragma once
#include <memory>

namespace tk {
namespace engine {

    class Engine
    {
    public:
        explicit Engine();
        virtual ~Engine() = default;

        void run();
        void shutdown();

    private:
        class Impl;
        std::shared_ptr<Impl> p_;
    };

}
}
