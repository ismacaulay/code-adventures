file(GLOB TEST_SRC_FILES *.cpp)

add_executable(cpp_tests ${TEST_SRC_FILES})
target_link_libraries(cpp_tests PRIVATE catch2 glm::glm toolkit)
add_test(NAME cpp COMMAND cpp_tests)
