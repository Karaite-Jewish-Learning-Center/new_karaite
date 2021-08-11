from collections import OrderedDict
from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.views.generic import View
from .models import (Organization,
                     BookAsArray,
                     Comment,
                     KaraitesBookDetails,
                     KaraitesBookAsArray,)


def book_chapter_verse(request, *args, **kwargs):
    """ Do Book chapter and verse check"""
    book = kwargs.get('book', None)
    chapter = kwargs.get('chapter', None)
    verse = kwargs.get('verse', None)
    stop_verse = kwargs.get('stop_verse', None)
    model = kwargs.get('model', None)

    if book is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)
    try:
        book_title = Organization.objects.get(book_title_en=book)
    except Organization.DoesNotExist:
        try:
            book_title = Organization.objects.get(book_title_he=book)
        except Organization.DoesNotExist:
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

    if model == 'comments':
        comments = Comment().to_json_comments(book=book_title, chapter=chapter, verse=verse)
        return JsonResponse({'comments': comments})

    if model == 'bookAsArray':
        chapter = BookAsArray().to_list(book=book_title, chapter=chapter)
        return JsonResponse({'chapter': chapter, 'book': book_title.to_json()}, safe=False)

    # deprecated
    if model == 'bookAsArrayOld':
        book = BookAsArray().to_json_book_array(book=book_title, chapter=chapter)
        return JsonResponse({'chapters': book,
                             'book': book_title.to_json()})


def karaites_book_details(request, *args, **kwargs):
    """ get all books details"""
    response = []
    for details in KaraitesBookDetails.objects.all():
        response.append(details.to_json(details.book_title))

    return JsonResponse({'details': response}, safe=False)


def karaites_book_as_array(request, *args, **kwargs):
    """ Do Book and chapter check"""
    book = kwargs.get('book', None)
    chapter = kwargs.get('chapter', None)

    if book is None:
        return JsonResponse(data={'status': 'false', 'message': _('Need a book name.')}, status=400)

    try:
        book_details = KaraitesBookDetails().to_json(book_title=book)
    except KaraitesBookDetails.DoesNotExist:
        return JsonResponse(data={'status': 'false', 'message': _(f'Book {book} not found.')}, status=400)

    try:
        if chapter is None:
            book_chapter = KaraitesBookAsArray().to_list(book=book_details['book_id'])
        else:
            book_chapter = KaraitesBookAsArray().to_list(book=book_details['book_id'], chapter_number=int(chapter))
    except KaraitesBookAsArray.DoesNotExist:
        return JsonResponse(data={'status': 'false', 'message': _(f'Chapter {chapter} not found.')}, status=400)

    return JsonResponse([book_chapter, book_details], safe=False)


class GetFirstLevel(View):
    """ Get first level classification"""
    @staticmethod
    def get(request):
        """ for the time being just fake the database query"""
        level = OrderedDict()
        level['Tanakh'] = """Torah, Prophets, and Writings, which together make up the Hebrew Bible, Judaism's foundational text."""
        level['Halakhah'] = """Legal works providing guidance on all aspects of Jewish life. Rooted in past sources and growing to address changing realities"""

        return JsonResponse(level)


class BooksPresentation(View):

    @staticmethod
    def get(request):
        return JsonResponse(Organization.get_list_of_books(), safe=False)


class GetComments(View):
    """"""

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'comments'})
        return book_chapter_verse(request, *args, **kwargs)


class GetBookAsArrayJson(View):

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'bookAsArray'})
        return book_chapter_verse(request, *args, **kwargs)


class GetBookAsArrayJsonOld(View):

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'bookAsArrayOld'})
        return book_chapter_verse(request, *args, **kwargs)


class getKaraitesAllBookDetails(View):

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'allBookDetails'})
        return karaites_book_details(request, *args, **kwargs)


class GetKaraitesBookAsArray(View):

    @staticmethod
    def get(request, *args, **kwargs):
        return karaites_book_as_array(request, *args, **kwargs)
