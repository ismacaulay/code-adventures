add_executable(meshopt main.cpp)
target_compile_features(meshopt PUBLIC cxx_std_17)
set_target_properties(meshopt PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS meshopt OPTIONAL RUNTIME DESTINATION bin/meshopt)
