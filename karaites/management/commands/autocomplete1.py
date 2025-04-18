import sys
import spacy
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       AutoComplete,
                       BookAsArray)

ENGLISH = 0
HEBREW = 1
VERSE = 4
CHAPTER = 5


class Command(BaseCommand):
    help = 'Populate autocomplete table'

    def handle(self, *args, **options):
        """
        """
        nlp = spacy.load("en_core_web_sm")

        sys.stdout.write("\33[K Deleting old data\r")
        AutoComplete.objects.all().delete()

        i = 1
        for book in Organization.objects.all():
            AutoComplete.objects.get_or_create(
                word_en=book.book_title_en,
                classification='B'
            )
            sys.stdout.write(f"\33[KProcessing Books: {i}\r")
            i += 1

        query = BookAsArray.objects.all()
        print(f"Processing {query.count()} Chapters")
        i = 1
        for chapter in query:
            for verse in chapter.book_text:
                word_list = nlp(verse[ENGLISH])
                for nouns in word_list.noun_chunks:

                    word = nouns.text
                    word = word.strip().lower()
                    word = word.replace('[', '').replace(']', '')

                    if word.startswith(', '):
                        word = word.replace(', ', '', 1)
                    if word.startswith('; '):
                        word = word.replace('; ', '', 1)
                    if word.startswith("'"):
                        word = word.replace("'", '', 1)
                    if word.startswith("-"):
                        word = word.replace("-", '', 1)
                    if word.startswith("("):
                        word = word.replace("(", '', 1)
                    if word.startswith(":"):
                        word = word.replace(":", '', 1)
                    if word.strip() == '':
                        continue

                    auto, created = AutoComplete.objects.get_or_create(
                        word_en=word,
                        classification='V'
                    )

                    if not created:
                        auto.word_count += 1
                        auto.save()

            sys.stdout.write(f"\33[KProcessing verse: {i}\r")
            i += 1
        print()
