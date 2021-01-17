#pragma once

namespace tk {
namespace engine {

    class FrameTime
    {
    public:
        explicit FrameTime();
        virtual ~FrameTime() = default;

        float update();
        float delta() const;

    private:
        float delta_;
        float last_;
    };

}
}
