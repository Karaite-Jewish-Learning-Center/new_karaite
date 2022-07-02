import sys
from django.core.management.base import BaseCommand
from ...models import (FirstLevel,
                       Organization,
                       BookAsArray,
                       References)

HEBREW = 0
ENGLISH = 2


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
        first_levels = FirstLevel.objects.all().exclude(first_level='Tanakh').values_list('first_level',
                                                                                          flat=True).order_by('order')
        first_levels = list(first_levels)
        print(first_levels)
        ppp
        array_len = len(first_levels)
        # [text english, text hebrew, _, _,
        # Verse number , Chapter, need render chapter title,
        # two positions for each first level reference
        # example Halakhah 1 reference English, 3 references in Hebrew for this book chapter and verse
        # Liturgy  0 reference English, 10 references in Hebrew for this book chapter and verse
        # Poetry   2 reference English, 0 references in Hebrew for this book chapter and verse
        # and so on for each first level
        # 0 text english,
        # 1 text hebrew,
        # 2 reserved,
        # 3 reserved,
        # 4 Verse number,
        # 5 Chapter,
        # 6 need render chapter title,
        # 7 Total bible references in Hebrew,
        # 8 Total bible references in English,
        # 9 Halakhah Hebrew
        # 10 Halakhah English
        # 11 Liturgy Hebrew
        # 12 Liturgy English
        # 13 Poetry Hebrew
        # 14 Poetry English
        # 15 Polemics Hebrew
        # 16 Polemics English
        # 17 Exhortatory Hebrew
        # 18 Exhortatory English
        # 19 Comments Hebrew
        # 20 Comments English
        # ...]

        size = (array_len + 2) * 2
        r = 1
        for chapter in BookAsArray.objects.all():
            for index in range(0, len(chapter.book_text)):
                chapter.book_text[index] = chapter.book_text[index][0:6] + ['0'] * size
            chapter.save()

        query = References.objects.all()
        sys.stdout.write(f"\rProcessing {query.count()} references")
        print()
        for ref in query:
            ref.error = ''
            ref.save()

            parts = ref.bible_ref_en.strip().replace('(', '').replace(')', '').split(' ')
            book, chapter_verse = " ".join(parts[:-1]), parts[-1]
            try:
                chapter, verse = chapter_verse.split(':')
            except ValueError:
                ref.error = '04'
                ref.save()
                continue

            bible_book = Organization.objects.get(book_title_en=book)

            try:
                chapter_text = BookAsArray.objects.get(book=bible_book, chapter=chapter)
            except BookAsArray.DoesNotExist:
                print('BookAsArray.DoesNotExist')
                ref.error = '02'
                ref.save()
                continue

            try:
                verse = int(verse) - 1
            except ValueError:
                print('ValueError')
                ref.error = '03'
                ref.save()
                continue

            index = first_levels.index(ref.karaites_book.first_level.first_level) + 9

            try:
                if ref.paragraph_text[HEBREW] != '':
                    chapter_text.book_text[verse][7] = f'{int(chapter_text.book_text[verse][7]) + 1}'
                    chapter_text.book_text[verse][index] = f'{int(chapter_text.book_text[verse][index]) + 1}'
                    chapter_text.save()
            except IndexError:
                pass
            except ValueError:
                print('ValueError')
                ref.error = '01'
                ref.save()

            try:
                if ref.paragraph_text[ENGLISH] != '':
                    index += 1
                    chapter_text.book_text[verse][8] = f'{int(chapter_text.book_text[verse][8]) + 1}'
                    chapter_text.book_text[verse][index] = f'{int(chapter_text.book_text[verse][index]) + 1}'
                    chapter_text.save()
            except IndexError:
                pass
            except ValueError:
                print('ValueError')
                ref.error = '01'
                ref.save()

            sys.stdout.write(f"\rSaving {r} references")
            r += 1
        print("\nDone")
