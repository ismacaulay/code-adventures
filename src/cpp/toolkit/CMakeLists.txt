set(TOOLKIT_SRC_FILES
    engine/engine.cpp
    engine/window.cpp
)

add_library(toolkit STATIC "${TOOLKIT_SRC_FILES}")
target_link_libraries(toolkit PUBLIC glfw glad spdlog)
target_include_directories(toolkit
    PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include ${CMAKE_CURRENT_SOURCE_DIR}/.. ${CMAKE_CURRENT_SOURCE_DIR}
)
message(${CMAKE_CURRENT_SOURCE_DIR})
target_compile_features(toolkit PUBLIC cxx_std_17)
set_target_properties(toolkit PROPERTIES CXX_EXTENSIONS OFF)
