project(opengl
    VERSION 1.0
    DESCRIPTION "OpenGL tutorials"
    LANGUAGES C CXX)

set(OPENGL_SRC_FILES
    src/main.cpp
)

add_executable(opengl ${OPENGL_SRC_FILES})
target_link_libraries(opengl PUBLIC toolkit)
target_compile_features(opengl PUBLIC cxx_std_17)
set_target_properties(opengl PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS opengl OPTIONAL RUNTIME DESTINATION bin/opengl)
