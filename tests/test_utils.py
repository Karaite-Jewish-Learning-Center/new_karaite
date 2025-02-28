import pytest
from ..karaites.utils import (search_level,
                              slug,
                              slug_back,
                              replace_punctuation_marks,
                              normalize_search,
                              only_english_stop_word)

from ..karaites.utils import (convert_time_to_seconds,
                              convert_seconds_to_time,
                              convert_time_string)


def test_search_level():
    assert search_level('Tanakh') == 1
    assert search_level('Comments') == 8
    assert search_level('Unknown') == 0


def test_slug():
    assert slug('this is a string   ') == 'this-is-a-string---'


def test_unslug():
    assert slug_back('this-is-a-string---') == 'this is a string   '


def test_replace_punctuation_marks():
    marks = """!()-[]{};:'"\\,"<>./?@#$%^&*_~"""
    result = len(marks) * ' '
    assert replace_punctuation_marks(marks) == result
    assert replace_punctuation_marks('‘’') == ''


def test_normalize_search():
    assert normalize_search("[THIS !''   is a string]") == 'this is a string'


def test_only_english_stop_word():
    assert only_english_stop_word('this is a string') is False
    assert only_english_stop_word('the them our') is True


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
        ("00:00:15:11", 15.0),
        ("00;:00:00:00", 0),
        ("no audio", 'No Audio'),
    ]

    # Iterate over the test cases and check if the actual output matches the expected output
    for input_time, expected_output in test_cases:
        actual_output = convert_time_to_seconds(input_time)
        assert actual_output == pytest.approx(expected_output,
                                              abs=0.01), f"Failed for input {input_time}. Expected output: {expected_output}. Actual output: {actual_output}"


def test_convert_time_string():
    assert convert_time_string(None) == 0
    assert abs(convert_time_string('01.9.8') - 69.8) < 0.001
    assert abs(convert_time_string('01.9.899') - 69.899) < 0.001
    assert abs(convert_time_string('03.6.0') - 186.0) < 0.001


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
