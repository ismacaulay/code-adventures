project(noise
    VERSION 1.0
    DESCRIPTION "Noise"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(noise ${SRC_FILES})
target_link_libraries(noise PUBLIC toolkit)
target_compile_features(noise PUBLIC cxx_std_17)
set_target_properties(noise PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS noise OPTIONAL RUNTIME DESTINATION bin/noise)
install(FILES ../../assets/shaders/basic_texture.glsl DESTINATION bin/noise/assets/shaders)
