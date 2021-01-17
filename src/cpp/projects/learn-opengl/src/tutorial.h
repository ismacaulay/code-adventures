#pragma once
#include "toolkit/engine.h"
#include "toolkit/logger.h"

class Tutorial : public tk::engine::Layer
{
protected:
    Tutorial(const std::string& name = "Unknown")
        : name_(name)
    {
        CAT_LOG_DEBUG("[learn-opengl] {0}", name);
    }
    virtual ~Tutorial() = default;

public:
    const std::string& name() const { return name_; };

private:
    std::string name_;
};
