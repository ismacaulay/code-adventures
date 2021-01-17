set(TOOLKIT_SRC_FILES
    engine/engine.cpp
    engine/time.cpp
    engine/window.cpp

    engine/camera/orthographic_camera.cpp

    engine/rendering/buffer_layout.cpp
    engine/rendering/index_buffer.cpp
    engine/rendering/opengl_renderer.cpp
    engine/rendering/render_command.cpp
    engine/rendering/renderer.cpp
    engine/rendering/shader.cpp
    engine/rendering/texture2d.cpp
    engine/rendering/vertex_array.cpp
    engine/rendering/vertex_buffer.cpp
)

add_library(toolkit STATIC "${TOOLKIT_SRC_FILES}")
target_link_libraries(toolkit PUBLIC glfw glad spdlog glm::glm stb)
target_include_directories(toolkit
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/.. ${CMAKE_CURRENT_SOURCE_DIR}
)
message(${CMAKE_CURRENT_SOURCE_DIR})
target_compile_features(toolkit PUBLIC cxx_std_17)
set_target_properties(toolkit PROPERTIES CXX_EXTENSIONS OFF)
