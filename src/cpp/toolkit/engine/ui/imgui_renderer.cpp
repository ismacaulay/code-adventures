#include "imgui_renderer.h"

// must be first
#include <glad/glad.h>

#include <GLFW/glfw3.h>
#include <imgui.h>
#include <imgui_impl_glfw.h>
#include <imgui_impl_opengl3.h>
#include <vector>

#include "engine/events/event.h"
#include "engine/layer.h"
#include "engine/window.h"

namespace tk {
namespace engine {

    class ImGuiRenderer::Impl
    {
    public:
        Impl() {}
        ~Impl() = default;

        void update()
        {
            ImGui_ImplOpenGL3_NewFrame();
            ImGui_ImplGlfw_NewFrame();
            ImGui::NewFrame();

            static ImGuiDockNodeFlags dockspace_flags =
                ImGuiDockNodeFlags_PassthruCentralNode;

            ImGuiWindowFlags window_flags =
                ImGuiWindowFlags_MenuBar | ImGuiWindowFlags_NoDocking;
            ImGuiViewport* viewport = ImGui::GetMainViewport();
            ImGui::SetNextWindowPos(viewport->GetWorkPos());
            ImGui::SetNextWindowSize(viewport->GetWorkSize());
            ImGui::SetNextWindowViewport(viewport->ID);
            ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, 0.0f);
            ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 0.0f);
            window_flags |= ImGuiWindowFlags_NoTitleBar |
                            ImGuiWindowFlags_NoCollapse |
                            ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove;
            window_flags |= ImGuiWindowFlags_NoBringToFrontOnFocus |
                            ImGuiWindowFlags_NoNavFocus;

            if (dockspace_flags & ImGuiDockNodeFlags_PassthruCentralNode)
                window_flags |= ImGuiWindowFlags_NoBackground;

            ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding,
                                ImVec2(0.0f, 0.0f));
            ImGui::Begin("DockSpace Demo", nullptr, window_flags);
            ImGui::PopStyleVar();
            ImGui::PopStyleVar(2);

            ImGuiID dockspace_id = ImGui::GetID("MyDockSpace");
            ImGui::DockSpace(dockspace_id, ImVec2(0.0f, 0.0f), dockspace_flags);

            // if (ImGui::BeginMenuBar()) {
            //     if (ImGui::BeginMenu("File")) {
            //         if (ImGui::MenuItem("Quit", NULL, false, true)) {
            //
            //         }
            //         ImGui::EndMenu();
            //     }
            //
            //     ImGui::EndMenuBar();
            // }

            for (auto it = layers_.begin(); it != layers_.end(); it++) {
                (*it)->render();
            }

            ImGui::End();
            ImGui::Render();
            ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

            // This is for viewports which doesn't work well with i3wm
            // // ImGuiIO& io = ImGui::GetIO();
            // // Update and Render additional Platform Windows
            // // (Platform functions may change the current OpenGL context, so
            // we
            // // save/restore it to make it easier to paste this code
            // elsewhere.
            // //  For this specific demo app we could also call
            // //  glfwMakeContextCurrent(window) directly)
            // if (io.ConfigFlags & ImGuiConfigFlags_ViewportsEnable) {
            //     GLFWwindow* backup_current_context = glfwGetCurrentContext();
            //     ImGui::UpdatePlatformWindows();
            //     ImGui::RenderPlatformWindowsDefault();
            //     glfwMakeContextCurrent(backup_current_context);
            // }
        }

        std::vector<std::shared_ptr<UILayer>> layers_;
    };

    std::unique_ptr<ImGuiRenderer::Impl> ImGuiRenderer::p_ =
        std::make_unique<ImGuiRenderer::Impl>();

    void ImGuiRenderer::init(const Window& window)
    {
        // Setup Dear ImGui context
        IMGUI_CHECKVERSION();
        ImGui::CreateContext();
        ImGuiIO& io = ImGui::GetIO();
        io.ConfigFlags |=
            ImGuiConfigFlags_NavEnableKeyboard; // enable keyboard events
        io.ConfigFlags |= ImGuiConfigFlags_DockingEnable;

        // viewports do not work well with i3wm
        // io.ConfigFlags |= ImGuiConfigFlags_ViewportsEnable;

        // Setup Dear ImGui style
        ImGui::StyleColorsDark();

        // When viewports are enabled we tweak WindowRounding/WindowBg so
        // platform windows can look identical to regular ones.
        ImGuiStyle& style = ImGui::GetStyle();

        // Setup Platform/Renderer bindings
        ImGui_ImplGlfw_InitForOpenGL((GLFWwindow*)window.native_window(), true);
        ImGui_ImplOpenGL3_Init("#version 330");
    }

    void ImGuiRenderer::shutdown()
    {
        p_->layers_.clear();

        ImGui_ImplOpenGL3_Shutdown();
        ImGui_ImplGlfw_Shutdown();
        ImGui::DestroyContext();

        p_ = nullptr;
    }

    bool ImGuiRenderer::process_event(const Event& event)
    {
        switch (event.type()) {
            case EventType::MouseMove:
            case EventType::MouseScroll:
            case EventType::MouseButtonPressed:
            case EventType::MouseButtonReleased:
                return ImGui::GetIO().WantCaptureMouse;
            case EventType::KeyPressed:
            case EventType::KeyReleased:
                return ImGui::GetIO().WantCaptureKeyboard;
            default:
                break;
        }

        return false;
    }

    void ImGuiRenderer::update() { p_->update(); }
    void ImGuiRenderer::push_layer(std::shared_ptr<UILayer> layer)
    {
        p_->layers_.push_back(layer);
    }

}
}
