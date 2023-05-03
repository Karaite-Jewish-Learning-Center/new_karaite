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
            # print feed back in same line
            print(f' Processing book:{book_chapter.book.book_title_en}  chapter:{book_chapter.chapter}            ', end='\r')

            i = 1
            chapter = []
            for verse in book_chapter.book_text:

                try:
                    query = BookAsArrayAudio.objects.get(book=book_chapter.book,
                                                         chapter=book_chapter.chapter,
                                                         verse=i)
                    if query.start_ms == 0 and query.end_ms == 0:
                        audio = [0, 0, 0]
                    else:
                        audio = [query.start_ms, query.end_ms, query.audio.id]
                except BookAsArrayAudio.DoesNotExist:
                    audio = [0, 0, 0]

                if len(verse) > 11:
                    tmp = list(verse)
                    tmp[11] = audio
                    chapter.append(tmp)
                else:
                    verse.append(audio)
                    chapter.append(verse)
                i += 1

            book_chapter.book_text = chapter
            book_chapter.save()
