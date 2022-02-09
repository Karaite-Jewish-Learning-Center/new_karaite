import sys
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookAsArray,
                       References)


class Command(BaseCommand):
    help = 'Update bible books with references from Karaites books'

    def add_arguments(self, parser):
        parser.add_argument(
            '--debug',
            default=False,
            action='store_true',
            help='Process all books',
        )

    def handle(self, *args, **options):
        """ update references in bible books
            increases a bit the size of data transfers, but
            avoids a lot of request to update total of comment, ref etc
        """
        # make all books array dimension  8
        i = 1
        r = 1
        for chapter in BookAsArray.objects.all():
            for line in chapter.book_text:
                if len(line) == 7:
                    line.append('0')
                else:
                    line[7] = '0'
            sys.stdout.write(f"\rUpdating array size: {i}")
            i += 1
            chapter.save()

        query = References.objects.all()
        sys.stdout.write(f"\rProcessing {query.count()} references")
        print()
        for ref in query:
            # missing bible reference
            if ref.bible_ref_en != '' and ref.bible_ref_en is not None:
                try:
                    parts = ref.bible_ref_en.strip().replace('(', '').replace(')', '').split(' ')
                    book, chapter_verse = " ".join(parts[:-1]), parts[-1]
                    chapter, verse = chapter_verse.split(':')
                    bible_book = Organization.objects.get(book_title_en=book)
                    chapter_text = BookAsArray.objects.get(book=bible_book, chapter=chapter)
                    verse = int(verse) - 1
                    chapter_text.book_text[verse][7] = f'{int(chapter_text.book_text[verse][7]) + 1}'
                    chapter_text.save()

                except IndexError:
                    ref.error = '00'
                    ref.save()
                except ValueError:
                    ref.error = '01'
                    ref.save()
                except BookAsArray.DoesNotExist:
                    ref.error = '02'
                    ref.save()

                if options['debug']:
                    print(f"Reference: {ref.bible_ref_en}, Searching :{book} Got:{bible_book}, {chapter}, {verse}")
                    input("Press Enter to continue...")

            sys.stdout.write(f"\rSaving {r} references")
            r += 1
        print("\nDone")
