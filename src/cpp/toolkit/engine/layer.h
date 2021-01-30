#pragma once
#include <memory>

namespace tk {
namespace engine {

    class Event;
    class Engine;

    class Layer
    {
    public:
        virtual ~Layer() = default;

        virtual void attach(Engine& engine) {}
        virtual void update(float delta) = 0;
        virtual void detach(Engine& engine) {}

        virtual bool process_event(const Event& event) { return false; }
    };

    class UILayer
    {
    public:
        virtual ~UILayer() = default;

        virtual void attach() {}
        virtual void render() = 0;
        virtual void detach() {}
    };

}
}
