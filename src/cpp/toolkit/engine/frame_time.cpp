#include "frame_time.h"

#include "time.h"

namespace tk {
namespace engine {

    FrameTime::FrameTime()
        : delta_(0.0)
        , last_(0.0)
    {}

    float FrameTime::update()
    {
        float current = Time::get_time();
        delta_ = current - last_;
        last_ = current;

        return delta_;
    }

    float FrameTime::delta() const { return delta_; }

}
}

