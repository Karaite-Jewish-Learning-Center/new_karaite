import sys
import re
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookAsArray,
                       References)

from ...utils import clear_terminal_line


class Command(BaseCommand):
    help = 'Update bible books with references from Karaites books'

    def handle(self, *args, **options):
        """ update references in bible books
            increses a bit the size of data transfers, but
            avoids lot of request to update total of comment, ref etc
        """
        # make all books array dimension  8
        i = 1
        for chapter in BookAsArray.objects.all():
            new_text = []
            for line in chapter.book_text:
                if len(line) == 7:
                    line.append('0')
                else:
                    line[7] = '0'
            sys.stdout.write(f"\33[K Updating array size: {i}\r")
            i += 1
            chapter.save()

        query = References.objects.all()
        print(f"Processing {query.count()} references")
        i = 1
        for ref in query:
            try:
                book, chapter_verse = ref.bible_ref_en.replace('(', '').replace(')', '').split(' ')
                chapter, verse = chapter_verse.split(':')
                bible_book = Organization.objects.get(book_title_en=book)
                chapter_text = BookAsArray.objects.get(book=bible_book, chapter=chapter)
                verse = int(verse)
                chapter_text.book_text[verse][7] = f'{int(chapter_text.book_text[verse][7]) + 1}'
                chapter_text.save()
                sys.stdout.write(f"\33[K Updating: {i}\r")
                i += 1
            except (ValueError, IndexError) as e:
                pass
