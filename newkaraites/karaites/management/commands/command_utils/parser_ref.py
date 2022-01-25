from hebrew_numbers import gematria_to_int
from .constants import BIBLE_BOOKS_NAMES

hebrew_book_names = BIBLE_BOOKS_NAMES


def parse_reference(ref):
    """ Parse hebrew biblical ref and translate to English"""
    ref = ref.replace('\n', ' ')
    parts = ref.replace('(', '').replace(')', '').split(' ')

    if len(parts) == 2:
        # if parts[0].find('\n') > 0:
        #     parts = parts[0].replace('\n', ' ').split(' ')
        parts = [parts[0]] + parts[1].split(',')

    if len(parts) == 3:
        book, chapter, verse = parts
        chapter = chapter.replace("'", '').replace('"', '')
        verse = verse.replace("'", '').replace('"', '')

    if len(parts) == 4:
        # book name has one or more spaces, like in "song of songs"
        book, chapter, verse = parts[0] + ' ' + parts[1], parts[2], parts[3]
        chapter = chapter.replace("'", '').replace('"', '')
        verse = verse.replace("'", '').replace('"', '')

    try:
        # some thing that I don't understand, maybe a bug in the library
        # chapter_arabic = gematria_to_int(chapter)
        # if chapter_arabic > 149:
        #     chapter_arabic = int(chapter_arabic / 1000)
        return f'({hebrew_book_names[book]} {gematria_to_int( chapter)}:{gematria_to_int(verse)})'

    except (KeyError, UnboundLocalError):
        pass

    return ''
