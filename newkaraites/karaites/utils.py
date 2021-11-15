import sys
import re
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL,
                        ENGLISH_STOP_WORDS)


def search_level(search_string):
    """ Search levels by name return level number"""
    for number, word in FIRST_LEVEL:
        if word == search_string:
            return number

    for number, word in SECOND_LEVEL:
        if word == search_string:
            return number
    return 0


def clear_terminal_line():
    sys.stdout.write(f"\33[K\r")


def slug(str):
    return str.replace(' ', '-')


def slug_back(str):
    return str.replace('-', ' ')


def replace_punctuation_marks(s):
    s = s.replace('‘', '').replace('’', '')
    return s.translate(str.maketrans('''!()-[]{};:'"\\,"<>./?@#$%^&*_~''', " " * 29))


def normalize_search(search):
    """ only one space, remove ' """
    search = search.replace("'", '')
    return re.sub(' +', ' ', search.strip())


def only_english_stop_word(search):
    """ Expects a normalized string
        return True if all words are English stop words
        return false if at list one is not a stop word
    """
    for word in search.split(''):
        if word in ENGLISH_STOP_WORDS:
            break
    else:
        return False
    return True


def prep_search(search):
    """ postgres full text search expect a normalize string"""
    return re.sub(' ', ' & ', search)
