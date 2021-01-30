project(imgui_example
    VERSION 1.0
    DESCRIPTION "ImGui Example"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(imgui_example ${SRC_FILES})
target_link_libraries(imgui_example PUBLIC toolkit)
target_compile_features(imgui_example PUBLIC cxx_std_17)
set_target_properties(imgui_example PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS imgui_example OPTIONAL RUNTIME DESTINATION bin/imgui)
install(DIRECTORY assets/ DESTINATION bin/imgui/assets)
install(DIRECTORY ../../assets/models/bunny DESTINATION bin/imgui/assets/models)
