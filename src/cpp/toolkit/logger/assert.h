#pragma once

#include "log.h"
#include <cstdlib>

// TODO: Remove in release build
#define CAT_ASSERT(cond)                                                       \
    if (cond) {                                                                \
    } else {                                                                   \
        CAT_LOG_ERROR("{0}:{1}:{2}: {3} assert failed",                        \
                      __FILE__,                                                \
                      __FUNCTION__,                                            \
                      __LINE__,                                                \
                      #cond);                                                  \
        std::abort();                                                          \
    }

// TODO: Make it so that you can specify multiple message args to be formatted
// by spdlog
#define CAT_ASSERTM(cond, ...)                                                 \
    if (cond) {                                                                \
    } else {                                                                   \
        CAT_LOG_ERROR("{}:{}:{}: {} assert failed: {}",                        \
                      __FILE__,                                                \
                      __FUNCTION__,                                            \
                      __LINE__,                                                \
                      #cond,                                                   \
                      __VA_ARGS__);                                            \
        std::abort();                                                          \
    }

#define CAT_ABORT(...) CAT_ASSERTM(false, __VA_ARGS__)
