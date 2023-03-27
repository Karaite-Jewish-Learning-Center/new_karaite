import pytest
from newkaraites.karaites.utils import (convert_time_to_seconds,
                                        convert_seconds_to_time)


def test_convert_time_to_seconds():
    # Test cases with inputs and expected outputs
    test_cases = [
        ("00:00:00.000", 0),
        ("00:00:59.999", 59.999),
        ("00:01:00.000", 60),
        ("01:01:00.555", 3660.555),
        ("24:00:00.000", 86400),
        ("24:00:01.001", 86401.001),
        ("00:00:00.01", 0.01),
        ("00:00:00:01", 0.01),

    ]

    # Iterate over the test cases and check if the actual output matches the expected output
    for input_time, expected_output in test_cases:
        actual_output = convert_time_to_seconds(input_time)
        assert actual_output == pytest.approx(expected_output,
                                              abs=0.01), f"Failed for input {input_time}. Expected output: {expected_output}. Actual output: {actual_output}"


def test_convert_seconds_to_time():
    # Test cases with inputs and expected outputs
    test_cases = [
        (0, "00:00:00.000"),
        (0.001, "00:00:00.001"),
        (0.01, "00:00:00.010"),
        (0.1, "00:00:00.100"),
        (1, "00:00:01.000"),
        (1.001, "00:00:01.001"),
        (59.999, "00:00:59.999"),
        (60, "00:01:00.000"),
        (60.001, "00:01:00.001"),
        (61, "00:01:01.000"),
        (61.001, "00:01:01.001"),
        (3660.555, "01:01:00.555"),
        (86400, "24:00:00.000"),
        (86401.001, "24:00:01.001"),
    ]

    # Iterate over the test cases and check if the actual output matches the expected output
    for input_time, expected_output in test_cases:
        actual_output = convert_seconds_to_time(input_time)
        assert actual_output == expected_output, f"Failed for input {input_time}. Expected output: {expected_output}. Actual output: {actual_output}"
