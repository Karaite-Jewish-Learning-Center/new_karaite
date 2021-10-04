import sys
from gensim.utils import tokenize
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       AutoComplete,
                       BookAsArray)
from more_itertools import windowed


ENGLISH = 0
HEBREW = 1
VERSE = 4
CHAPTER = 5


class Command(BaseCommand):
    help = 'Populate autocomplete table'

    def handle(self, *args, **options):
        """ 
        """
        sys.stdout.write("\33[K Deleting old data\r")
        AutoComplete.objects.all().delete()

        i = 1
        for book in Organization.objects.all():
            AutoComplete.objects.get_or_create(
                word_en=book.book_title_en,
            )
            sys.stdout.write(f"\33[KProcessing Books: {i}\r")
            i += 1

        query = BookAsArray.objects.all()
        print(f"Processing {query.count()} Chapters")
        for chapter in query:
            for verse in chapter.book_text:
                word_list = list(tokenize(verse[ENGLISH]))
                for word in word_list:
                    auto, created = AutoComplete.objects.get_or_create(
                        word_en=word
                    )

                    if not created:
                        auto.word_count += 1
                        auto.save()

                sys.stdout.write(f"\33[KProcessing verse: {i}\r")
                # make a windowed with 2,3,4...n words
                for n in [2, 3, 4, 5, 6]:
                    for combo in windowed(word_list, n=n, step=1):
                        auto, created = AutoComplete.objects.get_or_create(
                            word_en=" ".join(filter(None, combo))
                        )
                        if not created:
                            auto.word_count += 1
                            auto.save()
                i += 1
        print()
