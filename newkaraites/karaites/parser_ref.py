from hebrew_numbers import gematria_to_int

hebrew_book_names = {
    'בראשית': 'Genesis',
    'שמות': 'Exodus',
    'ויקרא': 'Leviticus',
    'במדבר': 'Numbers',
    'דברים': 'Deuteronomy',
    'עמוס': 'Amos',
    'יחזקאל': 'Ezekiel',
    'חבקוק': 'Habakkuk',
    'חגי': 'Haggai',
    'הושע': 'Hosea',
    'מלכים א': 'I Kings',
    'שמואל א': 'I Samuel',
    'מלכים ב': 'II Kings',
    'שמואל ב': 'II Samuel',
    'ישעיה': 'Isaiah',
    'ישעיהו': 'Isaiah',  # typo ?
    'ירמיה': 'Jeremiah',
    'ירמיהו': 'Jeremiah',  # typo ?
    'יואל': 'Joel',
    'יונה': 'Jonah',
    'יהושע': 'Joshua',
    'שופטים': 'Judges',
    'מלאכי': 'Malachi',
    'מיכה': 'Micah',
    'נחום': 'Nahum',
    'עובדיה': 'Obadiah',
    'זכריה': 'Zechariah',
    'צפניה': 'Zephaniah',
    'דניאל': 'Daniel',
    'קהלת': 'Ecclesiastes',
    'אסתר': 'Esther',
    'עזרא': 'Ezra',
    'דברי הימים א': 'I Chronicles',
    'דברי הימים ב': 'II Chronicles',
    'איוב': 'Job',
    'איכה': 'Lamentations',
    'נחמיה': 'Nehemiah',
    'משלי': 'Proverbs',
    'תהלים': 'Psalms',  # possible typo
    'תהילים': 'Psalms',
    'רות': 'Ruth',
    'שיר השירים': 'Song of Songs'
}


def parse_reference(ref):
    """ Parse hebrew biblical ref and translate to English"""
    ref = ref.replace('\n', ' ')
    parts = ref.replace('(', '').replace(')', '').split(' ')
    print(len(parts), parts)

    if len(parts) == 2:
        # if parts[0].find('\n') > 0:
        #     parts = parts[0].replace('\n', ' ').split(' ')
        parts = [parts[0]] + parts[1].split(',')

    if len(parts) == 3:
        book, chapter, verse = parts
        chapter = chapter.replace("'", '').replace('"', '')
        verse = verse.replace("'", '').replace('"', '')

    if len(parts) == 4:
        # book name has a space song of songs
        book, chapter, verse = parts[0] + ' ' + parts[1], parts[2], parts[3]
        chapter = chapter.replace("'", '').replace('"', '')
        verse = verse.replace("'", '').replace('"', '')
    # print(book, hebrew_book_names.get(book, None))
    # print(gematria_to_int(chapter))
    # print(gematria_to_int(verse))

    try:
        # some thing that I don't understand, maybe a bug in the library
        # chapter_arabic = gematria_to_int(chapter)
        # if chapter_arabic > 149:
        #     chapter_arabic = int(chapter_arabic / 1000)
        return f'({hebrew_book_names[book]} {gematria_to_int( chapter)}:{gematria_to_int(verse)})'

    except (KeyError, UnboundLocalError):
        pass

    return ''
