from django.db import connection
from django.conf import settings
from .models import EnglishWord
from .constants import IGNORED_WORDS_RESPONSE

# migrations fallback
try:
    ENGLISH_DICTIONARY = dict.fromkeys(EnglishWord.objects.all().values_list('word', flat=True), None)
except:
    ENGLISH_DICTIONARY = {}


def custom_sql(text, search):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""Select ts_headline('public.english_with_stopwords', '{text}', to_tsquery('public.english_with_stopwords', '{search}'),'MaxFragments=3,ShortWord=0')""")
            data = cursor.fetchone()
            if settings.DEBUG:
                print("Custom SQL", data)
            return data
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
        if word in IGNORED_WORDS_RESPONSE:
            continue
        # is word misspelled?
        if word in ENGLISH_DICTIONARY:
            continue

        # keep numbers as they are
        if word.isnumeric():
            continue

        for similar in find_similar_words(word):
            search = search.replace(word, similar[0])
            did_you_mean = True
    print("did_you mean", did_you_mean, search)
    return did_you_mean, search
