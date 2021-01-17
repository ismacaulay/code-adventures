project(learn_opengl
    VERSION 1.0
    DESCRIPTION "Learn OpenGL tutorials"
    LANGUAGES C CXX)

set(LEARN_OPENGL_SRC_FILES
    src/main.cpp
)

add_executable(learn_opengl ${LEARN_OPENGL_SRC_FILES})
target_link_libraries(learn_opengl PUBLIC toolkit)
target_compile_features(learn_opengl PUBLIC cxx_std_17)
set_target_properties(learn_opengl PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS learn_opengl OPTIONAL RUNTIME DESTINATION bin/learn-opengl)
install(DIRECTORY assets/ DESTINATION bin/learn-opengl/assets)
