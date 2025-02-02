from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from ftlangdetect import detect
from collections import OrderedDict
from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.views.generic import View
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

from .utils import (slug_back,
                    normalize_search,
                    prep_search,
                    highlight_hebrew)

from .utils_sql import (custom_sql,
                        similar_search_en)

from .models import (FirstLevel,
                     FullTextSearch,
                     FullTextSearchHebrew,
                     InvertedIndex,
                     Organization,
                     BookAsArray,
                     BookAsArrayAudio,
                     TableOfContents,
                     KaraitesBookDetails,
                     KaraitesBookAsArray,
    # LiturgyBook,
                     AutoComplete,
                     References)

from hebrew import Hebrew
import hebrew_tokenizer as tokenizer


def get_book_id(book):
    """ get book id from book title"""
    try:
        book_title = Organization.objects.get(book_title_en=book)
    except ObjectDoesNotExist:
        try:
            book_title = Organization.objects.get(book_title_he=book)
        except ObjectDoesNotExist:
            return None

    return book_title


@cache_page(settings.CACHE_TTL)
@vary_on_cookie
def book_chapter_verse(request, *args, **kwargs):
    """ Do Book chapter and verse check"""
    book = kwargs.get('book', None)
    chapter = kwargs.get('chapter', None)
    verse = kwargs.get('verse', None)
    first = kwargs.get('first', None)
    model = kwargs.get('model', None)

    if book is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)

    book = slug_back(book)

    book_title = get_book_id(book)
    if book_title is None:
        return JsonResponse(data={'status': 'false', 'message': _(f"Can't find book: {book}")}, status=400)

    if chapter is not None:
        try:
            chapter = int(chapter)
        except ValueError:
            data = {'status': 'false', 'message': _(f"Invalid chapter:{chapter} doesn't seams an int")}
            return JsonResponse(data=data, status=400)

        if chapter < 0 or chapter > book_title.chapters:
            message = _(f"Invalid chapter for the book:{book} chapter must be between 1 and {book_title.chapters}")
            return JsonResponse(data={'status': 'false', 'message': message}, status=400)

    if verse is not None:
        try:
            verse = int(verse.replace(',', '').replace('.', ''))
        except ValueError:
            data = {'status': 'false', 'message': _(f"Invalid verse:{verse} doesn't seams an int")}
            return JsonResponse(data=data, status=400)

        verses_on_this_chapter = book_title.verses[chapter - 1]
        if verse < 0 or verse > verses_on_this_chapter:
            message = _(f"Invalid verse for the book:{book} ")
            message += _(f"chapter:{chapter} must be between 1 and {verses_on_this_chapter}")
            return JsonResponse(data={'status': 'false', 'message': message}, status=400)

    if model == 'bookAsArray':
        if first is None:
            message = _("first parameter missing: first  must be between 0 and 1.")
            return JsonResponse(data={'status': 'false', 'message': message}, status=400)

        chapters = BookAsArray().to_list(book=book_title, chapter=chapter, book_title=book_title, first=first)
        return JsonResponse({'chapter': chapters, 'book': book_title.to_json()}, safe=False)

    if model == 'halakhah':
        ref = f'({book} {chapter}:{verse})'
        references = References().to_list(ref)
        return JsonResponse({'references': references}, safe=False)


@cache_page(settings.CACHE_TTL)
@vary_on_cookie
def karaites_book_details(request, *args, **kwargs):
    """ get all books details"""
    response = []
    for details in KaraitesBookDetails.objects.all():
        response.append(details.to_json(details.book_title_en))

    return JsonResponse({'details': response}, safe=False)


@cache_page(settings.CACHE_TTL)
@vary_on_cookie
def karaites_book_as_array(request, *args, **kwargs):
    """ Load Karaites book"""

    # Do Book and chapter check
    book = kwargs.get('book', None)
    paragraph_number = kwargs.get('chapter', None)
    first = kwargs.get('first', None)

    if book is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)

    if first is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need an 0 or 1 for "first" parameter.')}, status=400)

    if paragraph_number is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need a int for paragraph number')}, status=400)

    book = slug_back(book)
    print('slug', book)

    try:
        book_details = KaraitesBookDetails().to_json(book_title_unslug=book)
    except ObjectDoesNotExist:
        return JsonResponse(data={'status': 'false', 'message': _(f'Book details:{book}, not found.')}, status=400)

    try:
        book_paragraphs = KaraitesBookAsArray().to_list(book=book_details['book_id'],
                                                        paragraph_number=int(paragraph_number),
                                                        first=first)
    except ObjectDoesNotExist:
        return JsonResponse(data={'status': 'false',
                                  'message': _(f'Paragraph_number {paragraph_number} not found.')},
                            status=400)

    return JsonResponse([book_paragraphs, book_details], safe=False)


class GetFirstLevel(View):
    """ Get first level classification"""

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        """ Get first level Law"""
        level = OrderedDict()
        for first_level in FirstLevel.objects.all().values_list('first_level',
                                                                'first_level_he',
                                                                'break_on_classification',
                                                                'url').order_by('order'):
            level[first_level[3]] = first_level
        return JsonResponse(level, safe=False)


class GetByLevel(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        level = kwargs.get('level', None)
        if level is None:
            return JsonResponse(data={'status': 'false',
                                      'message': _(f'Missing mandatory parameter level.')},
                                status=400)

        return JsonResponse(KaraitesBookDetails.get_all_books_by_first_level(level), safe=False)


class GetByLevelAndByClassification(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        level = kwargs.get('level', None)
        if level is None:
            return JsonResponse(data={'status': 'false',
                                      'message': _(f'Missing mandatory parameter level.')},
                                status=404)
        books = KaraitesBookDetails.get_all_books_by_first_level(level, classification=True)

        if len(books) == 0:
            return JsonResponse(data={'status': 'false',
                                      'message': _(f'No books found for level:{level}.')},
                                status=404)

        return JsonResponse(books, safe=False)


class BooksPresentation(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request):
        return JsonResponse(Organization.get_list_of_books(), safe=False)


class GetBookAsArrayJson(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'bookAsArray'})
        return book_chapter_verse(request, *args, **kwargs)


class AudioBook(View):
    """ get audiobook start end times """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        book_id = kwargs.get(' ', None)
        if book_id is None:
            return JsonResponse(data={'status': 'false', 'message': _('Need a book id.')}, status=400)

        audio = list(BookAsArrayAudio.objects.filter(book_id=book_id).values_list('start_ms', 'end_ms'))

        return JsonResponse(audio, safe=False)


class GetKaraitesAllBookDetails(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'allBookDetails'})
        return karaites_book_details(request, *args, **kwargs)


class GetKaraitesBookAsArray(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        return karaites_book_as_array(request, *args, **kwargs)


class GetTOC(View):

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        book = kwargs.get('book', None)
        if book is None:
            return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)

        karaites_book = KaraitesBookDetails.objects.filter(book_title_unslug=slug_back(book))

        result = []
        for k_book in karaites_book:
            for toc in TableOfContents.objects.filter(karaite_book=k_book):
                result.append(toc.to_list())

        return JsonResponse(result, safe=False)


class GetHalakhah(View):
    """
    """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'halakhah'})
        return book_chapter_verse(request, *args, **kwargs)


class Test(View):
    """
     A very simple test to check if backend is running
    """

    @staticmethod
    def get(request, *args, **kwargs):
        return JsonResponse({"ok": True})


class Book(View):
    """
       Get the liturgy book
    """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        book_name = kwargs.get('book', None)
        if book_name is None:
            return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)

        return JsonResponse(KaraitesBookAsArray.get_book(book_name), safe=False)


class AutoCompleteView(View):
    """
        search based on the autocomplete selected
    """

    @staticmethod
    def get(request, *args, **kwargs):
        search = kwargs.get('search', None)

        if search is None:
            JsonResponse(data={'status': 'false', 'message': _('Need a search string.')}, status=400)

        search = normalize_search(search)
        search = prep_search(search)

        print('searching for :', search)

        sql = f"""select id,word_en, word_count,classification  from  autocomplete_view
                  where to_tsvector( word_en) @@ to_tsquery('{search}' || ':*')
                  limit 15"""
        auto = []

        for word in AutoComplete.objects.raw(sql):
            auto.append({'w': word.word_en, 'c': word.classification})

        return JsonResponse(auto, safe=False)


ITEMS_PER_PAGE = 15

# try phrase search
SQL_PHRASE = """SELECT id, path, reference_en, ts_rank_cd(text_en_search, query) AS rank """
SQL_PHRASE += """FROM karaites_fulltextsearch, phraseto_tsquery('{}') AS query """
SQL_PHRASE += """WHERE query @@ text_en_search  """
SQL_PHRASE += """ORDER BY rank DESC LIMIT {} OFFSET {}"""

# try word search
SQL_PLAIN = """SELECT id, path, reference_en, ts_rank_cd(text_en_search, query) AS rank """
SQL_PLAIN += """FROM karaites_fulltextsearch, plainto_tsquery('{}') AS query """
SQL_PLAIN += """WHERE query @@ text_en_search  """
SQL_PLAIN += """ORDER BY rank DESC LIMIT {} OFFSET {}"""


class Search(View):
    """
        search based on the autocomplete selected
    """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):

        search = kwargs.get('search', None)
        page = kwargs.get('page', 1)

        if search is None:
            JsonResponse(data={'status': 'false', 'message': _('Need a search string.')}, status=400)

        # maybe tokenize for dates, numbers, before trying to detect language
        guess = detect(search)
        language = guess['lang']

        limit = ITEMS_PER_PAGE
        offset = (page - 1) * ITEMS_PER_PAGE

        if language == 'he':
            results = set()
            highlight_word = []
            tokens = tokenizer.tokenize(search)
            for grp, token, token_num, _ in tokens:

                search_text = str(Hebrew(token).text_only())
                word_query = InvertedIndex.objects.get(word=search_text)
                # words to highlight
                highlight_word += word_query.word_as_in_text
                # get id of documents
                if not results:
                    results = set(word_query.documents)
                else:
                    results = results.intersection(set(word_query.documents))

            results = list(results)[offset:offset + limit]
            items = []
            for k, result in FullTextSearchHebrew.objects.in_bulk(results).items():
                items.append({'ref': result.reference_en,
                              'text': highlight_hebrew(result.text_he, highlight_word),
                              'path': result.path})

            return JsonResponse({'data': items, 'page': page}, safe=False)

        else:
            search = normalize_search(search)
            did_you_mean, similar_search = similar_search_en(search)
            search = prep_search(similar_search)

            # try phrase search
            results = FullTextSearch.objects.raw(SQL_PHRASE.format(search, limit, offset))
            print("1 Results ", len(results))

            if len(results) == 0:
                # try word search
                results = FullTextSearch.objects.raw(SQL_PLAIN.format(search, limit, offset))
                print("2 Results ", len(results))
            # avoid search by similar words since the cost of the query is high
            # from 0.012 ms to 0.600 ms on my machine
            # see similar_search_en for more details

            items = []
            for result in results:
                items.append({'ref': result.reference_en,
                              'text': (custom_sql(result.text_en, search)[0].replace('<b>', '<b style="color:#F00">'),),
                              'path': result.path})

            return JsonResponse({'data': items,
                                 'page': page,
                                 'did_you_mean': did_you_mean,
                                 'search_term': similar_search}, safe=False)


class GetBiBleReferences(View):
    """
        search by bible reference
    """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        reference = kwargs.get('reference', None)
        if reference is None:
            return JsonResponse(data={'status': 'false', 'message': _('Need a reference.')}, status=400)

        references = References.to_list(reference)

        return JsonResponse(references, safe=False)


class GetBiBleReferencesByLaw(View):
    """
        search by bible reference and classification
    """

    @staticmethod
    @cache_page(settings.CACHE_TTL)
    @vary_on_cookie
    def get(request, *args, **kwargs):
        reference = kwargs.get('reference', None)
        law = kwargs.get('law', None)

        if reference is None or law is None:
            return JsonResponse(data={'status': 'false', 'message': _('Need a reference and a classification.')},
                                status=400)

        references = References.to_list(reference, law)

        return JsonResponse(references, safe=False)
