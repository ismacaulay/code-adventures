
add_executable(meshopt main.cpp)
target_link_libraries(meshopt PUBLIC meshoptimizer assimp::assimp)
target_compile_features(meshopt PUBLIC cxx_std_17)
set_target_properties(meshopt PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS meshopt OPTIONAL RUNTIME DESTINATION bin/meshopt)
