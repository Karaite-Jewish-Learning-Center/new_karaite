import sys
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookAsArray,
                       FullTextSearch)
from hebrew_numbers import int_to_gematria

ENGLISH = 0
HEBREW = 1
VERSE = 4
CHAPTER = 5


class Command(BaseCommand):
    help = 'Update full text search database'

    def handle(self, *args, **options):
        """ 
        """
        sys.stdout.write("\33[K Deleting old data\r")
        FullTextSearch.objects.filter(delete=True).delete()

        i = 1
        for book in Organization.objects.all():
            FullTextSearch.objects.get_or_create(
                reference_en=book.book_title_en,
                text_en=book.book_title_en,
                reference_he=book.book_title_he,
                text_he=book.book_title_he,
                delete=True
            )
            sys.stdout.write(f"\33[KProcessing Books: {i}\r")
            i += 1

        query = BookAsArray.objects.all()
        print(f"Processing {query.count()} Chapters")
        for chapter in query:
            for verse in chapter.book_text:
                FullTextSearch.objects.get_or_create(
                    reference_en=f"{chapter.book.book_title_en} {verse[CHAPTER]}:{verse[VERSE]}",
                    text_en=verse[ENGLISH],
                    reference_he=f"{chapter.book.book_title_he} {int_to_gematria(verse[CHAPTER])}:{int_to_gematria(verse[VERSE])}",
                    text_he=verse[HEBREW],
                    delete=True
                )

                sys.stdout.write(f"\33[KProcessing verse: {i}\r")
                i += 1
        print()
