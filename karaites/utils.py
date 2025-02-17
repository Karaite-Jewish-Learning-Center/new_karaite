import sys
import re
from math import modf
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


def remove_stop_words(search):
    """ remove stop words from the search """
    return ' '.join([word for word in search.split(' ') if word not in ENGLISH_STOP_WORDS])


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


def convert_time_to_seconds(time):
    """ convert time to a float, values before decimal point are seconds, values after are milliseconds """
    time_parts = list(map(float, time.split(':')))
    ms, seconds = modf(time_parts[2])
    return round(time_parts[0] * 3600 + time_parts[1] * 60 + seconds + ms, 2)


def convert_seconds_to_time(time):
    """ convert seconds and milliseconds to start and end time"""
    hours_fraction, hours = modf(time / 3600)
    minutes_fraction, minutes = modf(hours_fraction * 3600 / 60)
    seconds_fraction, seconds = modf(minutes_fraction * 60)
    milliseconds = int(round(seconds_fraction * 1000, 1))

    if milliseconds == 1000:
        seconds += 1
        milliseconds = 0

    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}.{milliseconds:03}"


def convert_time_string(time_str):
    if not time_str:
        return 0

    parts = time_str.split('.')
    milliseconds = 0
    if len(parts) == 2:
        minutes, seconds = map(float, parts)
    elif len(parts) == 3:
        minutes, seconds, milliseconds = map(float, time_str.split('.'))
    else:
        raise ValueError(f'Invalid time string: {time_str}')

    print(minutes, seconds, milliseconds)
    return minutes * 60 + seconds + (float(f'0.{int(milliseconds)}'))


# implement a stack class
class Stack():

    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()

    def is_empty(self):
        return self.items == []

    def peek(self):
        if not self.is_empty():
            return self.items[-1]

    def get_stack(self):
        return self.items

    def size(self):
        return len(self.items)
