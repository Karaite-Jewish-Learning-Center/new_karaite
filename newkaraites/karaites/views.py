from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.views.generic import View
from .models import (Organization,
                     Comment)


class BooksPresentation(View):

    @staticmethod
    def get(request):
        return JsonResponse(Organization.get_list_of_books(), safe=False)


class GetComments(View):
    """"""

    @staticmethod
    def get(request, *args, **kwargs):
        book = kwargs.get('book', None)
        chapter = kwargs.get('chapter', None)
        verse = kwargs.get('verse', None)

        if book is None:
            return JsonResponse({'error': _('Need a book name.')})

        try:
            book_title = Organization.objects.get(book_title_en=book)
        except Organization.DoesNotExist:
            try:
                book_title = Organization.objects.get(book_title_he=book)
            except Organization.DoesNotExist:
                return JsonResponse({'error': _(f"Can't find book: {book}")})

        if chapter is None:
            return JsonResponse({'error': _('Need a Chapter number')})

        try:
            chapter = int(chapter)
        except ValueError:
            return JsonResponse({'error': _(f"Invalid chapter:{chapter} doesn't seams an int")})

        if verse is not None:
            try:
                verse = int(verse)
            except ValueError:
                return JsonResponse({'error': _(f"Invalid verse:{verse} doesn't seams an int")})

        if chapter < 0 or chapter > book_title.chapters:
            message = _(f"Invalid chapter for the book:{book} chapter must be between 1 and {book_title.chapters}")
            return JsonResponse({'error': message})

        if verse is not None:
            verses_on_this_chapter = book_title.verses[chapter - 1]
            if verse < 0 or verse > verses_on_this_chapter:
                message = _(f"Invalid verse for the book:{book} ")
                message += _(f"chapter:{chapter} must be between 1 and {verses_on_this_chapter}")
                return JsonResponse({'error': message})

        if verse is not None:
            comment = Comment.objects.get(book=book_title, chapter=chapter, verse=verse).to_json()
            return JsonResponse({'error': 'no',
                                 'comment': comment})
        else:
            comments = Comment().to_json_comments(book_title, chapter)
            return JsonResponse({'error': 'no',
                                 'comment': comments})


class GetBookChapterVerses(View):

    @staticmethod
    def get(request, *args, **kwargs):
        pass
