from django.core.management.base import BaseCommand
from ...models import (MisspelledWord,
                       EnglishWord)
from ...utils import find_similar_words


class Command(BaseCommand):
    def handle(self, *args, **options):
        """
            Test that the correct spelling is returned
            only for the words that exist in EnglishWord table
        """
        words_not_found = 0
        words_found = 0
        for mis in MisspelledWord.objects.all():
            for correct_word in mis.correct_word.split(','):
                try:
                    english_word = EnglishWord.objects.get(word=correct_word.strip())
                except EnglishWord.DoesNotExist:
                    words_not_found += 1
                    continue
                words_found += 1
                print(english_word)
                find_similar_words(mis.misspelled_word, english_word)
                input('Press Enter to continue...')
