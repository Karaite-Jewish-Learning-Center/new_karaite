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
        """ Update all bible references

             [text english, text hebrew, _, _,
             Verse number , Chapter, need render chapter title,
             two positions for each first level reference
             example Halakhah 1 reference English, 3 references in Hebrew for this book chapter and verse
             Liturgy  0 reference English, 10 references in Hebrew for this book chapter and verse
             Poetry   2 reference English, 0 references in Hebrew for this book chapter and verse
             and so on for each first level
             0 text english,
             1 text hebrew,
             2 reserved,
             3 reserved,
             4 Verse number,
             5 Chapter,
             6 need render chapter title,
             7 Total bible references in Hebrew,
             8 Total bible references in English,
             9 Halakhah Hebrew
             10 Halakhah English
             11 Liturgy Hebrew
             12 Liturgy English
             13 Poetry Hebrew
             14 Poetry English
             15 Polemics Hebrew
             16 Polemics English
             17 Exhortatory Hebrew
             18 Exhortatory English
             19 Comments Hebrew
             20 Comments English

        """

        first_levels = FirstLevel.objects.all().exclude(first_level='Tanakh').values_list('first_level',
                                                                                          flat=True).order_by('order')
        first_levels = list(first_levels)
        size = len(first_levels)
        for book_chapter in BookAsArray.objects.all().order_by('book', 'chapter', 'book__first_level'):
            chapter = []
            for verse in book_chapter.book_text:

                book_chapter_verse = f"({book_chapter.book.book_title_en} {book_chapter.chapter}:{verse[4]})"
                array_he = [0] * size
                array_en = [0] * size
                total_hebrew = 0
                total_english = 0

                for refs in References.objects.filter(bible_ref_en=book_chapter_verse):

                    index = first_levels.index(refs.karaites_book.first_level.first_level)

                    # hebrew
                    if refs.paragraph_text[2] != '':
                        total_hebrew += 1
                        array_he[index] += 1

                    # english
                    if refs.paragraph_text[0] != '':
                        total_english += 1
                        array_en[index] += 1

                chapter.append(verse[0:7] + [total_hebrew, total_english] + [array_he] + [array_en])

            book_chapter.book_text = chapter
            book_chapter.save()
