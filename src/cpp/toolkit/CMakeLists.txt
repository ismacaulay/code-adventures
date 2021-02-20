set(TOOLKIT_SRC_FILES
    engine/engine.cpp
    engine/frame_time.cpp
    engine/time.cpp
    engine/window.cpp

    engine/camera/camera_controller.cpp
    engine/camera/camera_controller2d.cpp
    engine/camera/free_camera_controller.cpp
    engine/camera/orbit_camera_controller.cpp
    engine/camera/orthographic_camera.cpp
    engine/camera/orthographic_camera2d.cpp
    engine/camera/perspective_camera.cpp

    engine/ecs/scene.cpp

    engine/events/input.cpp

    engine/models/mesh.cpp
    engine/models/model.cpp
    engine/models/model_loader.cpp

    engine/rendering/buffer_layout.cpp
    engine/rendering/framebuffer.cpp
    engine/rendering/index_buffer.cpp
    engine/rendering/opengl_renderer.cpp
    engine/rendering/render_command.cpp
    engine/rendering/renderer.cpp
    engine/rendering/renderer2d.cpp
    engine/rendering/shader.cpp
    engine/rendering/texture2d.cpp
    engine/rendering/vertex_array.cpp
    engine/rendering/vertex_buffer.cpp

    engine/ui/imgui_renderer.cpp
    engine/ui/scene_heirarchy_panel.cpp

    math/math.cpp
    math/box.cpp

    noise/noise_generator.cpp
)

add_library(toolkit STATIC "${TOOLKIT_SRC_FILES}")
target_link_libraries(toolkit PUBLIC glfw glad spdlog glm::glm stb assimp entt imgui FastNoise)
target_include_directories(toolkit
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/.. ${CMAKE_CURRENT_SOURCE_DIR}
)
target_compile_features(toolkit PUBLIC cxx_std_17)
set_target_properties(toolkit PROPERTIES CXX_EXTENSIONS OFF)
