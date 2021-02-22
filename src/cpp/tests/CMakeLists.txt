set(TEST_SRC_FILES
    test_main.cpp

    test_hello_world.cpp
    test_noise_generator.cpp
)

add_executable(cpp_tests ${TEST_SRC_FILES})
target_link_libraries(cpp_tests PRIVATE catch2 toolkit)
add_test(NAME cpp COMMAND cpp_tests)
