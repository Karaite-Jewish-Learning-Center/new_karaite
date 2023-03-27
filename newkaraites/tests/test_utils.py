from newkaraites.karaites.utils import (search_level,
                                        slug,
                                        slug_back,
                                        replace_punctuation_marks,
                                        normalize_search,
                                        only_english_stop_word)


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
