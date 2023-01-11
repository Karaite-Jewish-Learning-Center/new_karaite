import sys
import re
from django.db import connection
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL,
                        ENGLISH_STOP_WORDS)

from .models import EnglishWord

# migrations fallback
try:
    ENGLISH_DICTIONARY = dict.fromkeys(EnglishWord.objects.all().values_list('word', flat=True), None)
except:
    ENGLISH_DICTIONARY = {}


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
    """ postgres full text search expect a normalized string"""
    return re.sub(' ', ' & ', search)


def highlight_hebrew(text_he, search_word_list):
    text = text_he
    for search in search_word_list:
        text = text.replace(search, f'<b style="color:red">{search}</b>')
    return f"""<p class="search" dir="rtl">{text}</p>"""


def custom_sql(text, search):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""Select ts_headline('english', '{text}', to_tsquery('english', '{search}'),'MaxFragments=3,ShortWord=0')""")
            return cursor.fetchone()
    except Exception:
        return text


SQL_SIMILARITY = """select word ,word_count, SIMILARITY('{}', word) as similarity, """
SQL_SIMILARITY += """ levenshtein('{}', word) as distance  """
SQL_SIMILARITY += """From karaites_englishword  order by distance ASC, similarity DESC,  word_count  DESC limit 5"""


# some other metrics that might be useful to play around with if time permits
# sql += f""" levenshtein('{search}', word) as distance,  """
# sql += f""" difference('{search}', word) as difference  """
# sql += """From karaites_englishword order by  difference DESC,  similarity DESC,  distance ASC,  word_count DESC limit 10"""


def find_similar_words(search):
    """
        return a list of similar words
    """
    with connection.cursor() as cursor:
        search = search.replace("'", "''")
        cursor.execute(SQL_SIMILARITY.format(search, search))
        return cursor.fetchall()


def similar_search_en(search):
    """ replace the search string with similar words if word is misspelled """
    did_you_mean = False

    for word in search.split(' '):
        print("Similar Search", word)
        # is word misspelled?
        if word in ENGLISH_DICTIONARY:
            continue

        # keep numbers as they are
        if word.isnumeric():
            continue

        for similar in find_similar_words(word):
            search = search.replace(word, similar[0])
            did_you_mean = True

    return did_you_mean, search


