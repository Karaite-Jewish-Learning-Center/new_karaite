# constant for new karaites experiment


LANGUAGES = [
    ('en', 'English'),
    ('he', 'Hebrew'),
    ('he-en', 'Hebrew-English'),
    ('ja', 'Judeo-Arabic'),
    ('he-en-ar', 'Hebrew-English-Arabic'),
]

LANGUAGES_DICT = {'en': "English",
                  'he': "Hebrew",
                  'ja': 'Judeo-Arabic',
                  'he-en-ar': 'Hebrew-English-Arabic',
                  # this means a formatted table with hebrew and english
                  'he-en': 'Hebrew-English',

                  # technical "in," "toc" are not languages;
                  # we use to process introduction files and table of contents files
                  "in": "Introduction",
                  'toc': "TOC"}

BOOK_CLASSIFICATION = [
    ('00', 'Unknown'),
    # liturgy
    ('10', 'Havdala Songs'),
    ('15', 'Passover Songs'),
    ('18', 'Purim Songs'),
    ('20', 'Prayers'),
    ('30', 'Shabbat Songs'),
    ('40', 'Supplemental Readings for specific Torah portions'),
    ('45', 'Tammuz/Av/Echa'),
    ('47', 'Yom Kippur'),
    ('50', 'Wedding Songs'),
    # poetry
    ('55', 'Poetry'),
    # Polemic
    ('60', 'Polemic'),
    ('65', 'Exhortatory'),
    # test
    ('70', 'Test'),
    ('80', 'Comments'),
    # other
    ('90', 'Other'),

]
BOOK_CLASSIFICATION_DICT = dict(BOOK_CLASSIFICATION)

FIRST_LEVEL = [
    (1, 'Tanakh'),
    (2, 'Talmud'),
    (3, 'Halakhah'),
    (4, 'Liturgy'),
    (5, 'Polemics'),
    (6, 'Songs'),
    (7, 'Prayers'),
    (8, 'Comments'),
    (9, 'Poetry'),
    (10, 'Other'),
    (11, 'Exhortatory'),
]

FIRST_LEVEL_DICT = dict(FIRST_LEVEL)

FIRST_LEVEL_HE_DICT = {1: ['תנח', 0],
                       2: ['תַלמוּד', 1000],
                       3: ['הלכה', 2000],
                       4: ['פּוּלחָן', 3000],
                       5: ['פּוֹלמוֹס', 4000],
                       6: ['שירים', 5000],
                       7: ['תפילות', 6000],
                       8: ['הערות', 7000],
                       9: ['שִׁירָה', 8000],
                       10: ['אַחֵר', 9000],
                       11: ['מעודד', 10000]
                       }

SECOND_LEVEL = [
    (1, 'Torah'),
    (2, 'Prophets'),
    (3, 'Writings')
]

SECOND_LEVEL_DICT = dict(SECOND_LEVEL)

ENGLISH_STOP_WORDS = {
    'i': '',
    'me': '',
    'my': '',
    'myself': '',
    'we': '',
    'our': '',
    'ours': '',
    'ourselves': '',
    'you': '',
    'your': '',
    'yours': '',
    'yourself': '',
    'yourselves': '',
    'he': '',
    'him': '',
    'his': '',
    'himself': '',
    'she': '',
    'her': '',
    'hers': '',
    'herself': '',
    'it': '',
    'its': '',
    'itself': '',
    'they': '',
    'them': '',
    'their': '',
    'theirs': '',
    'themselves': '',
    'what': '',
    'which': '',
    'who': '',
    'whom': '',
    'this': '',
    'that': '',
    'these': '',
    'those': '',
    'am': '',
    'is': '',
    'are': '',
    'was': '',
    'were': '',
    'be': '',
    'been': '',
    'being': '',
    'have': '',
    'has': '',
    'had': '',
    'having': '',
    'do': '',
    'does': '',
    'did': '',
    'doing': '',
    'a': '',
    'an': '',
    'the': '',
    'and': '',
    'but': '',
    'if': '',
    'or': '',
    'because': '',
    'as': '',
    'until': '',
    'while': '',
    'of': '',
    'at': '',
    'by': '',
    'for': '',
    'with': '',
    'about': '',
    'against': '',
    'between': '',
    'into': '',
    'through': '',
    'during': '',
    'before': '',
    'after': '',
    'above': '',
    'below': '',
    'to': '',
    'from': '',
    'up': '',
    'down': '',
    'in': '',
    'out': '',
    'on': '',
    'off': '',
    'over': '',
    'under': '',
    'again': '',
    'further': '',
    'then': '',
    'once': '',
    'here': '',
    'there': '',
    'when': '',
    'where': '',
    'why': '',
    'how': '',
    'all': '',
    'any': '',
    'both': '',
    'each': '',
    'few': '',
    'more': '',
    'most': '',
    'other': '',
    'some': '',
    'such': '',
    'no': '',
    'nor': '',
    'not': '',
    'only': '',
    'own': '',
    'same': '',
    'so': '',
    'than': '',
    'too': '',
    'very': '',
    's': '',
    't': '',
    'can': '',
    'will': '',
    'just': '',
    'don': '',
    'should': '',
    'now': ''
}

HEBREW_STOP_WORDS = {

}

IGNORED_WORDS_RESPONSE = {
    "the": {
        "definition": "The definite article used to specify a particular person, place, or thing.",
        "message": "Your search term is too common and might not yield useful results. Try searching for specific book titles, authors, or topics instead."
    },
    "a": {
        "definition": "An indefinite article used before words beginning with a consonant sound.",
        "message": "This word is too general. Try specifying a book title, author, or subject for better results."
    },
    "an": {
        "definition": "An indefinite article used before words beginning with a vowel sound.",
        "message": "Common words like this don't refine search results well. Try using key terms from the book's title or a specific topic."
    },
    "and": {
        "definition": "A conjunction used to connect words, clauses, or sentences.",
        "message": "Using 'and' alone won’t narrow down your search. Consider adding a more descriptive keyword."
    },
    "but": {
        "definition": "A conjunction used to introduce a contrast or exception.",
        "message": "This word alone isn't helpful in searches. Try a more specific term or phrase."
    },
    "is": {
        "definition": "A verb used to describe a state of being.",
        "message": "This is a very common word and won't yield meaningful results. Try searching for a book title, author, or topic."
    },
    "are": {
        "definition": "A verb used to describe a state of being for plural subjects.",
        "message": "Common words like this are ignored in search. Try using a more specific query."
    },
    "in": {
        "definition": "A preposition indicating location or inclusion within something.",
        "message": "This preposition is too common to be useful in a search. Try specifying a book title or author instead."
    },
    "of": {
        "definition": "A preposition used to show belonging or relation.",
        "message": "Common words like 'of' don’t help refine search results. Try using a more unique term."
    },
    "with": {
        "definition": "A preposition indicating association or possession.",
        "message": "This word is ignored in search. Try including a book title, author, or topic for better results."
    },
    "on": {
        "definition": "A preposition indicating position or subject matter.",
        "message": "Common words like 'on' are ignored in search. Consider using a book title or a more specific term."
    },
    "at": {
        "definition": "A preposition indicating location or time.",
        "message": "This word is too general to improve search results. Try searching with more unique keywords."
    },
    "by": {
        "definition": "A preposition indicating the agent performing an action.",
        "message": "This preposition is too common for a meaningful search. Try specifying an author's name or book title."
    },
    "to": {
        "definition": "A preposition indicating direction or purpose.",
        "message": "Short words like 'to' don't refine search results well. Consider adding more descriptive terms."
    },
    "for": {
        "definition": "A preposition indicating purpose or intended recipient.",
        "message": "Common words like 'for' don't help in search. Try specifying a book title or topic instead."
    },
    "from": {
        "definition": "A preposition indicating the source of something.",
        "message": "This word alone won’t improve search accuracy. Consider adding an author's name or a subject."
    },
    "was": {
        "definition": "A past tense form of 'to be.'",
        "message": "Words like 'was' are ignored in search. Try searching for a book title, author, or subject instead."
    },
    "were": {
        "definition": "A past tense form of 'to be' used with plural subjects.",
        "message": "Common words like 'were' don’t refine search results. Try using a more descriptive query."
    },
    "can": {
        "definition": "A modal verb used to express ability or possibility.",
        "message": "Using 'can' alone won’t narrow down your search. Consider adding a specific keyword."
    },
    "will": {
        "definition": "A modal verb used to express future intent or certainty.",
        "message": "This word alone won’t yield useful search results. Try searching with a book title or author’s name."
    },
    "all": {
        "definition": "A determiner referring to the entire quantity of something.",
        "message": "General words like 'all' may not help refine search results. Try using a more specific keyword."
    },
    "most": {
        "definition": "A superlative adjective meaning the greatest amount or number.",
        "message": "This word is too vague for search. Try adding a book title, author, or topic."
    },
    "some": {
        "definition": "A determiner meaning an unspecified amount.",
        "message": "This word is too general for a meaningful search. Try specifying a title, author, or topic."
    },
    "not": {
        "definition": "An adverb used to negate a verb.",
        "message": "Using 'not' alone won’t provide useful results. Try a more specific keyword or phrase."
    },
    "now": {
        "definition": "An adverb referring to the present moment.",
        "message": "This word alone won’t refine your search. Try searching for a book title or author instead."
    },
    "why": {
        "definition": "An interrogative word used to ask for a reason.",
        "message": "General words like 'why' might not yield useful results. Try specifying a topic or book title."
    },
    "who": {
        "definition": "An interrogative pronoun used to ask about a person.",
        "message": "Common words like 'who' don’t refine search results well. Try searching for an author or book title."
    },
    "how": {
        "definition": "An interrogative word used to ask about manner or method.",
        "message": "This word alone may not give useful results. Try using more specific terms like book titles or authors."
    },
}


AUTOCOMPLETE_TYPE = [
    ('B', 'Book'),
    ('V', 'Verse')
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

    'ישעיהו': 'Isaiah',  # typo ?
    'ישעיה': 'Isaiah',
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
    # 'תהליםקט': 'Psalms',
    # 'תהליםל': 'Psalms',
    'תהילים': 'Psalms',
    'רות': 'Ruth',
    'שיר השירים': 'Song of Songs'
}

REF_ERROR_CODE = [
    ('--', '--'),
    ('00', 'Verse number to big.'),
    ('01', 'Chapter number to big.'),
    ('02', 'Bible book does not exist!'),
    ('03', 'Invalid int for verse.'),
    ('04', 'Missing Chapter or verse.'),
]

VERSE_TABLE = {
    'Genesis': [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
    'Exodus': [22, 25, 22, 31, 23, 30, 29, 28, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 23, 37, 30, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
    'Leviticus': [17, 16, 17, 35, 26, 23, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
    'Numbers': [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 35, 28, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
    'Deuteronomy': [46, 37, 29, 49, 30, 25, 26, 20, 29, 22, 32, 31, 19, 29, 23, 22, 20, 22, 21, 20, 23, 29, 26, 22, 19, 19, 26, 69, 28, 20, 30, 52, 29, 12],
    'Joshua': [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
    'Judges': [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
    'I Samuel': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
    'I-Samuel': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
    'II Samuel': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
    'II-Samuel': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
    'I Kings': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'I-Kings': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'II Kings': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    'II-Kings': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    'Isaiah': [31, 22, 26, 6, 30, 13, 25, 23, 20, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 11, 25, 24],
    'Jeremiah': [19, 37, 25, 31, 31, 30, 34, 23, 25, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
    'Ezekiel': [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 44, 37, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
    'Hosea': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'Joel': [20, 27, 5, 21],
    'Amos': [15, 16, 15, 13, 27, 14, 17, 14, 15],
    'Obadiah': [21],
    'Jonah': [16, 11, 10, 11],
    'Micah': [16, 13, 12, 14, 14, 16, 20],
    'Nahum': [14, 14, 19],
    'Habakkuk': [17, 20, 19],
    'Zephaniah': [18, 15, 20],
    'Haggai': [15, 23],
    'Zechariah': [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
    'Malachi': [14, 17, 24],
    'Psalms': [6, 12, 9, 9, 13, 11, 18, 10, 21, 18, 7, 9, 6, 7, 5, 11, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 27, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 14, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 20, 14, 9, 6],
    'Proverbs': [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
    'Job': [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 32, 26, 17],
    'Song of Songs': [17, 17, 11, 16, 16, 12, 14, 14],
    'Song-of-Songs': [17, 17, 11, 16, 16, 12, 14, 14],
    'Ruth': [22, 23, 18, 22],
    'Lamentations': [22, 22, 66, 22, 22],
    'Ecclesiastes': [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
    'Esther': [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
    'Daniel': [21, 49, 33, 34, 30, 29, 28, 27, 27, 21, 45, 13],
    'Ezra': [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
    'Nehemiah': [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
    'I Chronicles': [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    'I-Chronicles': [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    'II Chronicles': [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
    'II-Chronicles': [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
}
