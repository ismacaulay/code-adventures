project(voxelization
    VERSION 1.0
    DESCRIPTION "Voxelization"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(voxelization ${SRC_FILES})
target_link_libraries(voxelization PUBLIC toolkit)
target_compile_features(voxelization PUBLIC cxx_std_17)
set_target_properties(voxelization PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS voxelization OPTIONAL RUNTIME DESTINATION bin/voxelization)
install(FILES ../../assets/shaders/bunny.glsl DESTINATION bin/voxelization/assets/shaders)
install(DIRECTORY ../../assets/models/bunny DESTINATION bin/voxelization/assets/models)
