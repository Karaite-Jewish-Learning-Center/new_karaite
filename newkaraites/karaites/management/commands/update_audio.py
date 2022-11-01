from django.core.management.base import BaseCommand
from ...models import (BookAsArray,
                       BookAsArrayAudio)


class Command(BaseCommand):
    help = 'Update audio bible books'

    def add_arguments(self, parser):
        parser.add_argument(
            '--debug',
            default=False,
            action='store_true',
            help='Update audio bible books start and stop times for each verse',
        )

    def handle(self, *args, **options):
        """ Update audio bible books start and stop times """

        for book_chapter in BookAsArray.objects.all().order_by('book', 'chapter'):
            i = 0
            chapter = []
            for verse in book_chapter.book_text:

                try:
                    query = BookAsArrayAudio.objects.get(book=book_chapter, verse=i)
                    audio = [query.start_ms, query.end_ms]
                except BookAsArrayAudio.DoesNotExist:
                    audio = [0, 0]

                print(len(verse))
                if len(verse) > 11:
                    verse[11] = audio[0]
                    verse[12] = audio[1]
                    chapter.append(verse)
                else:
                    chapter.append([verse, audio[0], audio[1]])
                i += 1

            book_chapter.book_text = chapter
            book_chapter.save()
