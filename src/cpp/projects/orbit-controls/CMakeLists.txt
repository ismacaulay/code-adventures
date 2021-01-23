project(orbit_controls
    VERSION 1.0
    DESCRIPTION "Orbit Controls"
    LANGUAGES C CXX)

set(SRC_FILES
    src/main.cpp
)

add_executable(orbit_controls ${SRC_FILES})
target_link_libraries(orbit_controls PUBLIC toolkit)
target_compile_features(orbit_controls PUBLIC cxx_std_17)
set_target_properties(orbit_controls PROPERTIES
    CXX_EXTENSIONS OFF
)

install(TARGETS orbit_controls OPTIONAL RUNTIME DESTINATION bin/orbit-controls)
install(DIRECTORY assets/ DESTINATION bin/orbit-controls/assets)
