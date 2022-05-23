import sys
from django.core.management.base import BaseCommand
from ...models import (MisspelledWord,
                       EnglishWord)
from ...utils import find_similar_words
from tqdm import tqdm
from timeit import default_timer as timer


class Command(BaseCommand):

    @staticmethod
    def Analyze():
        """
            Test that the correct spelling is returned
            only for the words that exist in EnglishWord table
        """
        words_not_found_in_english_table = 0
        found_not_corrected = 0
        found_correct = 0
        total_misspelled_words = 0
        total_correct_words = 0
        total_correct_words_found_english_table = 0
        total_query_words = 0
        pbar = tqdm(MisspelledWord.objects.all(), desc="Analyzing misspelled words")
        english_dict = dict.fromkeys(EnglishWord.objects.all().values_list('word', flat=True), None)

        for mis in pbar:
            total_misspelled_words += 1

            for correct_word in mis.correct_word.split(','):
                correct_word = correct_word.strip().lower()
                # remove Cape Town and alike for the time being
                if correct_word.find(' ') != -1:
                    continue

                total_correct_words += 1
                if correct_word in english_dict:
                    total_correct_words_found_english_table += 1
                else:
                    words_not_found_in_english_table += 1
                    continue

                results = find_similar_words(mis.misspelled_word)
                # print(f"{mis.misspelled_word} -> {correct_word}")
                # for c in results:
                #     print(f"""{c[0]:25} {c[1]:6}, {c[2]:0.2f}, {c[3]:2} """)
                # input('Press Enter to continue...')
                for c in results[0:1]:
                    total_query_words += 1

                    if c[0] in english_dict and c[0] == correct_word:
                        found_correct += 1
                        break
                else:
                    found_not_corrected += 1

        print(f"{total_correct_words_found_english_table} Words found in EnglishWord table")
        print(f"{words_not_found_in_english_table} Words not found in EnglishWord table")
        print(f"{total_misspelled_words} Total misspelled words")
        print(f"{found_correct} Rightly corrected words")
        print(f"{found_not_corrected} Fail to correct")
        print(f"{total_query_words} Total queries to EnglishWords dictionary")
        print(sys.getsizeof(english_dict), "Size of English_dict")

    def handle(self, *args, **options):
        """ Run the command and measure the time """
        start = timer()
        self.Analyze()
        print(f"Time taken: {timer() - start}")
