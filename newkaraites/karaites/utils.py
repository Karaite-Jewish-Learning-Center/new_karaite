import sys
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL)


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
