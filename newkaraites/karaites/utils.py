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


def slug(string):
    return string.replace(' ', '-')


def slug_back(string):
    return string.replace('-', ' ')


def replace_punctuation_marks(s):
    s = s.replace('‘', '').replace('’', '')
    return s.translate(str.maketrans('''!()-[]{};:'"\\,"<>./?@#$%^&*_~''', " " * 29))


def normalize_search(search):
    """ only one space, remove ' """
    search = search.replace("'", '').replace('[', '').replace(']', '')
    search = replace_punctuation_marks(search)
    return re.sub(' +', ' ', search.strip().lower())


def only_english_stop_word(search):
    """ Expects a normalized string
        return True if all words are English stop words
        return false if at list one is not a stop word
    """
    for word in search.split(' '):
        if word not in ENGLISH_STOP_WORDS:
            break
    else:
        return True
    return False


def prep_search(search):
    """ postgres full text search expect a normalized string
        all space are replaced by space&space
    """
    search = normalize_search(search)
    return re.sub(' ', ' & ', search)


def highlight_hebrew(text_he, search_word_list):
    text = text_he
    for search in search_word_list:
        text = text.replace(search, f'<b style="color:red">{search}</b>')
    return f"""<p class="search" dir="rtl">{text}</p>"""
