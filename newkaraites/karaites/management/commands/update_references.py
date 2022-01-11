import sys
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookAsArray,
                       References)


class Command(BaseCommand):
    help = 'Update bible books with references from Karaites books'

    def handle(self, *args, **options):
        """ update references in bible books
            increases a bit the size of data transfers, but
            avoids a lot of request to update total of comment, ref etc
        """
        # make all books array dimension  8
        i = 1
        for chapter in BookAsArray.objects.all():
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
                # missing bible reference
                if ref.bible_ref_en == '':
                    continue

                parts = ref.bible_ref_en.strip().replace('(', '').replace(')', '').split(' ')
                if len(parts) == 2:
                    book, chapter_verse = parts[0:2]
                elif len(parts) == 3:
                    book, chapter_verse = parts[0:2], parts[3]

                chapter, verse = chapter_verse.split(':')
                bible_book = Organization.objects.get(book_title_en=book)
                chapter_text = BookAsArray.objects.get(book=bible_book, chapter=chapter)
                verse = int(verse) - 1
                chapter_text.book_text[verse][7] = f'{int(chapter_text.book_text[verse][7]) + 1}'
                chapter_text.save()
                sys.stdout.write(f"\33[K Updating: {i}\r")
                i += 1

            # todo list of errors and locations for further investigation
            except (ValueError, IndexError, BookAsArray.DoesNotExist) as e:
                print(e)
