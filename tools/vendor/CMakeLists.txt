#
# meshoptimizer
#
# add_subdirectory(meshoptimizer)

set(MESHOPTIMIZER_SRCS
    meshoptimizer/src/meshoptimizer.h
    meshoptimizer/src/allocator.cpp
    meshoptimizer/src/clusterizer.cpp
    meshoptimizer/src/indexcodec.cpp
    meshoptimizer/src/indexgenerator.cpp
    meshoptimizer/src/overdrawanalyzer.cpp
    meshoptimizer/src/overdrawoptimizer.cpp
    meshoptimizer/src/simplifier.cpp
    meshoptimizer/src/spatialorder.cpp
    meshoptimizer/src/stripifier.cpp
    meshoptimizer/src/vcacheanalyzer.cpp
    meshoptimizer/src/vcacheoptimizer.cpp
    meshoptimizer/src/vertexcodec.cpp
    meshoptimizer/src/vertexfilter.cpp
    meshoptimizer/src/vfetchanalyzer.cpp
    meshoptimizer/src/vfetchoptimizer.cpp
)

add_library(meshoptimizer STATIC "${MESHOPTIMIZER_SRCS}")
target_include_directories(meshoptimizer INTERFACE "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/meshoptimizer/src>")
target_compile_features(meshoptimizer PUBLIC cxx_std_17)
set_target_properties(meshoptimizer PROPERTIES CXX_EXTENSIONS OFF)
