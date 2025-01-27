import re
from hebrew_numbers import gematria_to_int

IGNORE = ['(#default#VML)',
          '(Web)',
          '("Yeriot%20Shelomo%20volume%201.fld/header.html")',
          '(ששה ימים לאחר שסיים את תפקידיו במצרים)',
          """(כפי שהיה נוהג לעשות זאת בכל הספרים שהיה מעיין בהם)""",
          """(ששה ימים לאחר שסיים את תפקידיו במצרים)""",
          '(ברוך)',
          """(נגד ספר"משא קרים"לאפרים דיינגרד)""",
          """(נגד דת הנצרות)""",
          """(ראה הערה מספר 8)."""
          """(כפי שהיה נוהג לעשות זאת בכל הספרים שהיה מעיין בהם)""",
          """(נגד ספר"משא קרים"לאפרים דיינגרד)"""
          '(בחג הסוכות)',
          '(אַתְּ)',
          '(הֹלֶכֶת)',
          """(ח', י"ט)""",
          """(וְקִבְּלוּ)""",
          """(יַעַשׂ)""",
          """(ראה הערה מספר 8)"""
          # volume 2
          """(ח', י"ט)"""
          '(י"א,  ל"ג),',
          '(יִהְיוּ-) ',
          '(שָׁחוּט)',
          '(דְּבָרוֹ)',
          '(כ"ו, י"ט)',
          '(רַגְלְךָ)',
          '(הוא הנ"ל)',
          '(ח"ב, כ"ג)',
          """(ט', א')""",
          """(ח', י,ט)""",
          """(י"א,ל"ג)""",
          """(יִהְיוּ-)""",
          """(Biblical Verses)""",
          """(Anochi)""",
          """(Ani)""",
          """(</span>Anochi)""",
          """(Ishmael)""",
          """(ben Joseph?)""",
          """(and the refrain)""",
          """(Vayyosha‘)""",
          """(בית חדש מאת ר' יואל סירקיש)""",
          """(מאת ר' בצלאל אשכנזי)""",
          """(השני)""",
          """(שמואלא כה, כא)""",
          """(מתחיל בסוף דף כב)""",
          """(במדבר ל, יג; ל,טז)""",
          """(בית חדש מאת ר' יואל סירקיש)""",
          """(מאת ר' בצלאל אשכנזי)""",
          """("ריוח")""",
          """("אחרית רשעים תראה")""",
          """((""",
          """(אָנָּא זְכוֹר רַחֵם לְעַם בֹּטֵחַ)""",
          """(Anna zechorraḥem le‘amboteyaḥ)""",
          """שמות כ, יא; שמות לא, יז""",
          """("seasilk" "byssus")""",
          """(1777 - 1855)""",
          """(7+1)""",
          """(Songs)""",
          """(?)""",
          """(2nd ed., 2007)""",
          """(2011)""",
          """(שמות לג:ו-ז)""",
          """(במדבר טז:יא-יג)"""
          ]
REMOVE = [
    """(Anochi) """,
    'ראה',  # seems to be a typo
]

ABBREVIATIONS = [
    ('Is.', 'Isaiah'),
    ('Ps.', 'Psalms'),
    ('Ex.', 'Exodus'),
    ('Lev.', 'Leviticus'),
    ('Deut.', 'Deuteronomy'),
    ('Josh.', 'Joshua'),
    ('Judg.', 'Judges'),
    ('Ruth.', 'Ruth'),
]

BIBLE_BOOKS_NAMES = {
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
    # 'ישעיהו': 'Isaiah',  # typo ?
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
    'תהליםקט': 'Psalms',
    'תהליםל': 'Psalms',
    'תהילים': 'Psalms',
    'רות': 'Ruth',
    'שיר השירים': 'Song of Songs'
}
hebrew_book_names = BIBLE_BOOKS_NAMES.keys()
english_book_names = BIBLE_BOOKS_NAMES.values()


def parse_reference(ref):
    """ Parse biblical ref and translate to English if needed.
        reference may be in English or Hebrew
    """

    if len(ref) > 30:
        return '', ''
    if ref in IGNORE:
        return '', ''

    ref = ref.replace('\n', ' ').replace('(', '').replace(')', '')

    for remove in REMOVE:
        ref = ref.replace(remove, '')

    for hebrew_book_name in hebrew_book_names:
        candidate = ref.replace(hebrew_book_name, '')
        if candidate != ref:
            try:
                if candidate.find(',') > 0:
                    chapter, verse = candidate.strip().split(',')
                else:
                    chapter, verse = candidate.strip().split(':')

                return f'({BIBLE_BOOKS_NAMES[hebrew_book_name]} {gematria_to_int(chapter)}:{gematria_to_int(verse)})', 'he'
            except ValueError:
                pass
    # replace multiple spaces by one space
    ref = re.sub(r"\s+", ' ', ref)
    # remove repeating spaces before and after :
    ref = re.sub(r":\s*", ':', ref)
    ref = re.sub(r"\s*:", ':', ref)

    parts = ref.split(' ')
    book = ' '.join(parts[:-1])
    # expand abbreviations
    for abbrev, full_name in ABBREVIATIONS:
        book = book.replace(abbrev, full_name)

    # ref is in english
    if book in english_book_names:
        return f'({book} {parts[-1]})', 'en'

    return '', ''

# print(parse_reference('(Ex. 10:  26)'))
#  print(parse_reference("""(ישעיהוסב, ה')"""))
# print(parse_reference('(תהליםקטז, י"ז)'))
# print(parse_reference('(יחזקאלכ, כט)'))
