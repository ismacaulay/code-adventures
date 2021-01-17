#pragma once
#include <iostream>
#include <sstream>

#include "key_codes.h"
#include "mouse_codes.h"

namespace tk {
namespace engine {

    enum class EventType
    {
        None = 0,

        WindowClose,
        WindowResize,

        KeyPressed,
        KeyReleased,

        MouseMove,
        MouseButtonPressed,
        MouseButtonReleased,
        MouseScroll,
    };

    class Event
    {
    public:
        virtual ~Event() = default;

        virtual EventType type() const = 0;

        virtual std::string to_string() const
        {
            std::stringstream ss;
            ss << "Event: type " << static_cast<int>(type());
            return ss.str();
        }
    };

    inline std::ostream& operator<<(std::ostream& os, const Event& e)
    {
        return os << e.to_string();
    }

    class WindowCloseEvent : public Event
    {
    public:
        explicit WindowCloseEvent() = default;
        ~WindowCloseEvent() = default;

        EventType type() const override { return EventType::WindowClose; }
    };

    class WindowResizeEvent : public Event
    {
    public:
        explicit WindowResizeEvent(int width, int height)
            : width_(width)
            , height_(height)
        {}
        ~WindowResizeEvent() = default;

        EventType type() const override { return EventType::WindowResize; }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "WindowResizeEvent: width " << width() << ", height "
               << height();
            return ss.str();
        }

        int width() const { return width_; }
        int height() const { return height_; }

    private:
        int width_;
        int height_;
    };

    class KeyEvent : public Event
    {
    public:
        int key() const { return key_; }

    protected:
        explicit KeyEvent(int key)
            : key_(key)
        {}

    private:
        int key_;
    };

    class KeyPressedEvent : public KeyEvent
    {
    public:
        explicit KeyPressedEvent(int key, int repeat_count)
            : KeyEvent(key)
            , repeat_count_(repeat_count)
        {}
        ~KeyPressedEvent() = default;

        EventType type() const override { return EventType::KeyPressed; }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "KeyPressedEvent: key " << key() << ", repeat_count "
               << repeat_count();
            return ss.str();
        }

        int repeat_count() const { return repeat_count_; }

    private:
        int repeat_count_;
    };

    class KeyReleasedEvent : public KeyEvent
    {
    public:
        explicit KeyReleasedEvent(int key)
            : KeyEvent(key)
        {}
        ~KeyReleasedEvent() = default;

        EventType type() const override { return EventType::KeyReleased; }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "KeyReleasedEvent: key " << key();
            return ss.str();
        }
    };

    class MouseMoveEvent : public Event
    {
    public:
        MouseMoveEvent(float x_pos, float y_pos)
            : x_pos_(x_pos)
            , y_pos_(y_pos)
        {}
        ~MouseMoveEvent() = default;

        EventType type() const override { return EventType::MouseMove; }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "MouseMoveEvent: x " << x() << ", y " << y();
            return ss.str();
        }

        float x() const { return x_pos_; }
        float y() const { return y_pos_; }

    private:
        float x_pos_, y_pos_;
    };

    class MouseScrollEvent : public Event
    {
    public:
        MouseScrollEvent(float x_offset, float y_offset)
            : x_offset_(x_offset)
            , y_offset_(y_offset)
        {}
        ~MouseScrollEvent() = default;

        EventType type() const override { return EventType::MouseScroll; }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "MouseScrollEvent: x_offset " << x_offset() << ", y_offset "
               << y_offset();
            return ss.str();
        }

        float x_offset() const { return x_offset_; }
        float y_offset() const { return y_offset_; }

    private:
        float x_offset_, y_offset_;
    };

    class MouseButtonEvent : public Event
    {
    public:
        int button() const { return button_; }
        float x() const { return x_; }
        float y() const { return y_; }

    protected:
        MouseButtonEvent(int button, float x, float y)
            : button_(button)
            , x_(x)
            , y_(y)
        {}

    private:
        int button_;
        float x_, y_;
    };

    class MouseButtonPressedEvent : public MouseButtonEvent
    {
    public:
        MouseButtonPressedEvent(int button, float x, float y)
            : MouseButtonEvent(button, x, y)
        {}
        ~MouseButtonPressedEvent() = default;

        EventType type() const override
        {
            return EventType::MouseButtonPressed;
        }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "MouseButtonPressedEvent: button " << button();
            return ss.str();
        }
    };

    class MouseButtonReleasedEvent : public MouseButtonEvent
    {
    public:
        MouseButtonReleasedEvent(int button, float x, float y)
            : MouseButtonEvent(button, x, y)
        {}
        ~MouseButtonReleasedEvent() = default;

        EventType type() const override
        {
            return EventType::MouseButtonReleased;
        }

        std::string to_string() const override
        {
            std::stringstream ss;
            ss << "MouseButtonReleasedEvent: button " << button();
            return ss.str();
        }
    };
}
}
