#pragma once

namespace tk {
namespace engine {

    class Event;
    class Engine;

    class Layer
    {
    public:
        virtual ~Layer() = default;

        virtual void attach(const Engine& engine) {}
        virtual void update(float delta) = 0;
        virtual void detach(const Engine& engine) {}

        virtual bool process_event(const Event& event) { return false; }
    };

}
}
