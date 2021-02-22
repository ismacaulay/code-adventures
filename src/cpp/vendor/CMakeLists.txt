#
# catch
#
add_library(catch2 INTERFACE)
target_include_directories(catch2 INTERFACE catch/include)

#
# FastNoise
#
add_library(FastNoise INTERFACE)
target_include_directories(FastNoise INTERFACE FastNoise/include)

#
# glad
#
add_library(glad STATIC glad/src/glad.c)
target_include_directories(glad PUBLIC glad/include)
target_link_libraries(glad PUBLIC dl)
target_compile_features(glad PUBLIC cxx_std_17)
set_target_properties(glad PROPERTIES CXX_EXTENSIONS OFF)

#
# imgui
#
set(IMGUI_SRCS
    imgui/imgui.cpp
    imgui/imgui_demo.cpp
    imgui/imgui_draw.cpp
    imgui/imgui_tables.cpp
    imgui/imgui_widgets.cpp
    imgui/backends/imgui_impl_opengl3.cpp
    imgui/backends/imgui_impl_glfw.cpp)

add_library(imgui STATIC "${IMGUI_SRCS}")
target_link_libraries(imgui PUBLIC glfw glad ${OPENGL_LIBRARIES})
target_include_directories(imgui PUBLIC imgui)
target_include_directories(imgui PUBLIC imgui/backends)
target_compile_features(imgui PUBLIC cxx_std_17)
set_target_properties(imgui PROPERTIES CXX_EXTENSIONS OFF)

#
# stb
#
set(STB_SRCS
    stb/src/stb_image.cpp
)

add_library(stb STATIC "${STB_SRCS}")
target_include_directories(stb PUBLIC stb/include)
target_compile_features(stb PUBLIC cxx_std_17)
set_target_properties(stb PROPERTIES CXX_EXTENSIONS OFF)

