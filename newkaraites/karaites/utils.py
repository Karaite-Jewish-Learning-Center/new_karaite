import sys
import re
from django.db import connection
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL,
                        ENGLISH_STOP_WORDS)
from jellyfish import levenshtein_distance


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
    """ postgres full text search expect a normalized string"""
    return re.sub(' ', ' & ', search)


def highlight_english(text_en, search_word, text_en_search):
    # account for Capitalized words
    search_words = search_word.lower().split(' ')
    print(search_words)
    text = text_en.lower()
    original_text = []
    for word in search_words:
        pos = text.find(word)
        original_text.append(text_en[pos:pos + len(word)])
    print('original_text', original_text)
    for word in original_text:
        if word == '':
            continue
        text_en = text_en.replace(word, f'<b><i>{word}</i></b>')

    return f"""<p dir="ltr">{text_en}</p>"""


def highlight_hebrew(text_he, search_word_list):
    text = text_he
    for search in search_word_list:
        text = text.replace(search, f'<b style="color:red">{search}</b>')
    return f"""<p class="search" dir="rtl">{text}</p>"""


def custom_sql(text, search):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"Select ts_headline('english', '{text}', to_tsquery('english', '{search}'),'MaxFragments=3,ShortWord=0')")
            return cursor.fetchone()
    except Exception:
        return text


def find_similar_words(search, english_word):
    """
        return a list of similar words
    """
    with connection.cursor() as cursor:
        sql = f"""select word ,word_count, SIMILARITY('{search}', word)"""
        sql += """ as similarity from karaites_englishword order by similarity DESC, word_count DESC limit 10"""
        cursor.execute(sql)
        print('english_word', english_word, ' search', search)
        for c in cursor.fetchall():
            print(f"{c[0]:20}{c[2]:3.5f}{c[1]:10}{levenshtein_distance(c[0],search):20.2f}")
