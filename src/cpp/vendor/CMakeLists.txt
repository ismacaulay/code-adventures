#
# assimp
#
# SET(BUILD_SHARED_LIBS OFF CACHE BOOL "Build assimp static libs")
# SET(ASSIMP_LIB_INSTALL_DIR ${CMAKE_CURRENT_SOURCE_DIR}/assimp/lib)
# SET(ASSIMP_INCLUDE_INSTALL_DIR ${CMAKE_CURRENT_SOURCE_DIR}/assimp/include)
# SET(ASSIMP_BIN_INSTALL_DIR ${CMAKE_CURRENT_SOURCE_DIR}/assimp/bin)
# add_subdirectory(assimp)
# UNSET(BUILD_SHARED_LIBS)

#
# glad
#
add_library(glad STATIC glad/src/glad.c)
target_include_directories(glad PUBLIC glad/include)
target_link_libraries(glad PUBLIC dl)
target_compile_features(glad PUBLIC cxx_std_17)
set_target_properties(glad PROPERTIES CXX_EXTENSIONS OFF)

#
# glm
#
# add_subdirectory(glm)

#
# imgui
#
# set(IMGUI_SRCS
#     imgui/imgui.cpp
#     imgui/imgui_demo.cpp
#     imgui/imgui_draw.cpp
#     imgui/imgui_widgets.cpp
#     imgui/examples/imgui_impl_opengl3.cpp
#     imgui/examples/imgui_impl_glfw.cpp)
#
# add_library(imgui STATIC "${IMGUI_SRCS}")
# target_link_libraries(imgui PUBLIC glfw glad ${OPENGL_LIBRARIES})
# target_include_directories(imgui PUBLIC imgui)
# target_include_directories(imgui PUBLIC imgui/examples)
# target_compile_features(imgui PUBLIC cxx_std_17)
# set_target_properties(imgui PROPERTIES CXX_EXTENSIONS OFF)

#
# spdlog
#
add_subdirectory(spdlog)

#
# stb
#
# set(STB_SRCS
#     stb/src/stb_image.cpp
# )
#
# add_library(stb STATIC "${STB_SRCS}")
# target_include_directories(stb PUBLIC stb/include)
# target_compile_features(stb PUBLIC cxx_std_17)
# set_target_properties(stb PROPERTIES CXX_EXTENSIONS OFF)
#
