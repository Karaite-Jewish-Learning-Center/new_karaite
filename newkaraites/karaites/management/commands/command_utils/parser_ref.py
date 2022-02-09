from hebrew_numbers import gematria_to_int
from .constants import BIBLE_BOOKS_NAMES


hebrew_book_names = BIBLE_BOOKS_NAMES
english_book_names = BIBLE_BOOKS_NAMES.values()


def parse_reference(ref):
    """ Parse biblical ref and translate to English if needed.
        reference may be in English or Hebrew
    """
    ref = ref.replace('\n', ' ')
    parts = ref.replace('(', '').replace(')', '').split(' ')
    book = ' '.join(parts[:-1])

    # ref is in english
    if book in english_book_names:
        return f'({book} {parts[-1]})'

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

    if hebrew_book_names.get(book, None) is not None:
        try:
            return f'({hebrew_book_names[book]} {gematria_to_int(chapter)}:{gematria_to_int(verse)})'
        except UnboundLocalError:
            pass
    if book in english_book_names:
        return f'({book} {chapter}:{verse})'
    return ''

# parse_reference('(ויקרא יא, מג)')