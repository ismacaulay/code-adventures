set(TOOLKIT_SRC_FILES
    engine/camera/orthographic_camera.cpp
    engine/buffer_layout.cpp
    engine/engine.cpp
    engine/index_buffer.cpp
    engine/shader.cpp
    engine/vertex_array.cpp
    engine/vertex_buffer.cpp
    engine/window.cpp
    engine/opengl_renderer.cpp
    engine/renderer.cpp
    engine/render_command.cpp
)

add_library(toolkit STATIC "${TOOLKIT_SRC_FILES}")
target_link_libraries(toolkit PUBLIC glfw glad spdlog glm::glm)
target_include_directories(toolkit
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/.. ${CMAKE_CURRENT_SOURCE_DIR}
)
message(${CMAKE_CURRENT_SOURCE_DIR})
target_compile_features(toolkit PUBLIC cxx_std_17)
set_target_properties(toolkit PROPERTIES CXX_EXTENSIONS OFF)
