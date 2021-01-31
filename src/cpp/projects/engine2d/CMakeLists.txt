project(engine2d
    VERSION 1.0
    DESCRIPTION "Engine2d"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(engine2d ${SRC_FILES})
target_link_libraries(engine2d PUBLIC toolkit)
target_compile_features(engine2d PUBLIC cxx_std_17)
set_target_properties(engine2d PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS engine2d OPTIONAL RUNTIME DESTINATION bin/engine2d)
install(FILES ../../assets/shaders/basic_texture.glsl DESTINATION bin/engine2d/assets/shaders)
