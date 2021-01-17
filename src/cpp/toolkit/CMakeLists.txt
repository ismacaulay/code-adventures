set(TOOLKIT_SRC_FILES
    engine/buffer_layout.cpp
    engine/camera/orthographic_camera.cpp
    engine/engine.cpp
    engine/index_buffer.cpp
    engine/opengl_renderer.cpp
    engine/render_command.cpp
    engine/renderer.cpp
    engine/shader.cpp
    engine/time.cpp
    engine/vertex_array.cpp
    engine/vertex_buffer.cpp
    engine/window.cpp
)

add_library(toolkit STATIC "${TOOLKIT_SRC_FILES}")
target_link_libraries(toolkit PUBLIC glfw glad spdlog glm::glm)
target_include_directories(toolkit
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/.. ${CMAKE_CURRENT_SOURCE_DIR}
)
message(${CMAKE_CURRENT_SOURCE_DIR})
target_compile_features(toolkit PUBLIC cxx_std_17)
set_target_properties(toolkit PROPERTIES CXX_EXTENSIONS OFF)
