from django.core.management.base import BaseCommand
from ...models import (BookAsArray,
                       BookAsArrayAudio)


class Command(BaseCommand):
    help = 'Populate audio bible books with empty start and stop times'

    def add_arguments(self, parser):
        parser.add_argument(
            '--debug',
            default=False,
            action='store_true',
            help='Populate audio bible books with empty start and stop times',
        )

    def handle(self, *args, **options):
        """ Populate audio bible books with empty start and stop times """

        for book in BookAsArray.objects.all().order_by('book', 'chapter'):
            i = 1
            for _ in book.book_text:
                try:
                    BookAsArrayAudio.objects.get(book=book, chapter=book.chapter, verse=i)
                except BookAsArrayAudio.DoesNotExist:
                    BookAsArrayAudio.objects.create(book=book,
                                                    chapter=book.chapter,
                                                    verse=i
                                                    )

                i += 1
