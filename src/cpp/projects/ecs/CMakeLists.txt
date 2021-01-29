project(ecs
    VERSION 1.0
    DESCRIPTION "ECS Example"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(ecs ${SRC_FILES})
target_link_libraries(ecs PUBLIC toolkit)
target_compile_features(ecs PUBLIC cxx_std_17)
set_target_properties(ecs PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS ecs OPTIONAL RUNTIME DESTINATION bin/ecs)
install(DIRECTORY assets/ DESTINATION bin/ecs/assets)
install(DIRECTORY ../../assets/models/bunny DESTINATION bin/ecs/assets/models)
