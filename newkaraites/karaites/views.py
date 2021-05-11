from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.views.generic import View
from .models import (Organization,
                     BookText,
                     BookAsArray,
                     Comment)


class BooksPresentation(View):

    @staticmethod
    def get(request):
        return JsonResponse(Organization.get_list_of_books(), safe=False)


def book_chapter_verse(request, *args, **kwargs):
    """ Do Book chapter and verse check"""
    book = kwargs.get('book', None)
    chapter = kwargs.get('chapter', None)
    verse = kwargs.get('verse', None)
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
            verse = int(verse)
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

    if model == 'bookText':
        book = BookText().to_json_books(book=book_title, chapter=chapter, verse=verse)
        return JsonResponse({'book_text': book})

    if model == 'bookAsArray':
        book = BookAsArray().to_json(book=book_title, chapter=chapter)
        return JsonResponse({'book_text': book})


class GetComments(View):
    """"""

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'comments'})
        return book_chapter_verse(request, *args, **kwargs)


class GetBookChapterVerses(View):

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'bookText'})
        return book_chapter_verse(request, *args, **kwargs)


class GetBookAsArrayJson(View):

    @staticmethod
    def get(request, *args, **kwargs):
        kwargs.update({'model': 'bookAsArray'})
        return book_chapter_verse(request, *args, **kwargs)
