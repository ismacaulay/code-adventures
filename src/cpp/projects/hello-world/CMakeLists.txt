project(hello_world
    VERSION 1.0
    DESCRIPTION "Hello World"
    LANGUAGES C CXX)

set(HELLO_WORLD_SRC_FILES
    src/main.cpp
)

add_executable(hello_world ${HELLO_WORLD_SRC_FILES})
target_compile_features(hello_world PUBLIC cxx_std_17)
set_target_properties(hello_world PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS hello_world OPTIONAL RUNTIME DESTINATION bin/hello-world)
