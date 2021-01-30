#include "scene_heirarchy_panel.h"

#include <entt/entt.hpp>
#include <imgui.h>

#include "engine/ecs/components.h"
#include "engine/ecs/scene.h"

namespace tk {
namespace engine {
    SceneHeirarchyPanel::SceneHeirarchyPanel(Scene& scene)
        : scene_(scene)
    {}

    void SceneHeirarchyPanel::render()
    {
        static ImGuiWindowFlags window_flags =
            ImGuiWindowFlags_DockNodeHost | ImGuiWindowFlags_NoCollapse;

        ImGui::Begin("Scene Heirarchy", nullptr, window_flags);

        scene_.registry_.each([&](auto& entity_id) {
            auto entity = Entity{ entity_id, &scene_.registry_ };

            auto& tag = entity.get_component<TagComponent>().tag;

            ImGuiTreeNodeFlags flags = ImGuiTreeNodeFlags_OpenOnArrow;
            flags |= ImGuiTreeNodeFlags_SpanAvailWidth;
            ImGui::TreeNodeEx(
                (void*)(uint64_t)(uint32_t)entity_id, flags, tag.c_str());
        });

        ImGui::End();
    }
}
}
