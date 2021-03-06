cmake_minimum_required(VERSION 3.12...3.16)

if(${CMAKE_VERSION} VERSION_LESS 3.12)
    cmake_policy(VERSION ${CMAKE_MAJOR_VERSION}.${CMAKE_MINOR_VERSION})
endif()

file(TO_CMAKE_PATH "${PROJECT_BINARY_DIR}/CMakeLists.txt" LOC_PATH)
if(EXISTS "${LOC_PATH}")
    message(FATAL_ERROR "You cannot build in a source directory (or any directory with a CMakeLists.txt file). Please make a build subdirectory. Feel free to remove CMakeCache.txt and CMakeFiles.")
endif()

project(code-adventures
    VERSION 1.0
    DESCRIPTION "Code adventures"
    LANGUAGES C CXX)

if (APPLE)
    find_package(GLFW3 REQUIRED)
    find_package(OpenGL REQUIRED)
endif()

# conan package setup
include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup()

# set(THREADS_PREFER_THREAD_FLAG ON)
# find_package(Threads REQUIRED)

# set(CMAKE_BUILD_TYPE Debug)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_definitions(-DIMGUI_IMPL_OPENGL_LOADER_GLAD)
add_subdirectory(vendor)
add_subdirectory(toolkit)
add_subdirectory(projects)

enable_testing()
add_subdirectory(tests)

set(CMAKE_INSTALL_PREFIX ${CMAKE_CURRENT_SOURCE_DIR} CACHE PATH "Setting CMAKE_INSTALL_PREFIX" FORCE)
