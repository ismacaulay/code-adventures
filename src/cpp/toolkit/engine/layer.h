#pragma once

namespace tk {
namespace engine {

    class Event;

    class Layer
    {
    public:
        virtual ~Layer() = default;

        virtual void attach() {}
        virtual void update(float delta) = 0;
        virtual void detach() {}

        virtual bool process_event(const Event& event) { return false; }
    };

}
}
