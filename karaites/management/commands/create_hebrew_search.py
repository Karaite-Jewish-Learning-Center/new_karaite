import sys
from hebrew import Hebrew
import hebrew_tokenizer as tokenizer
from django.core.management.base import BaseCommand
from ...models import (FullTextSearchHebrew,
                       InvertedIndex)


class Command(BaseCommand):
    help = 'Create Hebrew Index '

    @staticmethod
    def delete_old_databases():
        sys.stdout.write("\rDeleting Inverted index.")
        InvertedIndex.objects.all().delete()

    @staticmethod
    def parse_hebrew_words(query):
        # parse hebrew words

        total = query.count()
        word_dict = {}
        i = 1
        for sentences in query:
            sys.stdout.write(f"\rProcessing sentence {i} of {total}        ")
            i += 1
            tokens = tokenizer.tokenize(sentences.text_he)
            for grp, token, token_num, (_, _) in tokens:
                if grp in ['HEBREW', 'DATE', 'HOUR']:
                    # remove nikud, cantilation
                    text_only = Hebrew(token).text_only()
                    if text_only in word_dict:
                        word_dict[text_only] += 1
                    else:
                        word_dict[text_only] = 1
        return word_dict

    @staticmethod
    def populate_database_list(word_dict):

        total = len(word_dict)
        i = 1
        for w, c in word_dict.items():
            if i % 1000 == 0:
                sys.stdout.write(f"\rProcessing word {i} of {total}          ")

            InvertedIndex.objects.get_or_create(
                word=w,
                count=c,
                documents=[],
                count_by_document=[],
            )
            i += 1

    @staticmethod
    def populate_inverted_index(query):
        total = query.count()
        i = 0
        for sentences in query:
            sys.stdout.write(f"\rProcessing sentence {i} of {total}        ")
            i += 1
            tokens = tokenizer.tokenize(sentences.text_he)
            for grp, token, _, (_, _) in tokens:
                if grp in ['HEBREW', 'DATE', 'HOUR']:
                    text_only_word = Hebrew(token).text_only()
                    word = InvertedIndex.objects.get(word=text_only_word)

                    if sentences.id not in word.documents:
                        word.documents.append(sentences.id)
                        word.count_by_document.append(0)

                    # important for highlight search words in search results
                    if token not in word.word_as_in_text:
                        word.word_as_in_text.append(token)

                    word.count_by_document[word.documents.index(sentences.id)] += 1
                    word.save()

    def handle(self, *args, **options):

        self.delete_old_databases()

        query = FullTextSearchHebrew.objects.all()

        word_dict = self.parse_hebrew_words(query)
        self.populate_database_list(word_dict)

        self.populate_inverted_index(query)
