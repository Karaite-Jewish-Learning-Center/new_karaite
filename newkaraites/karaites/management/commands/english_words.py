from tqdm import tqdm
from spacy.tokenizer import Tokenizer
from spacy.lang.en import English
from django.core.management.base import BaseCommand
from ...models import (EnglishWord,
                       FullTextSearch, )
from .command_utils.utils import remove_punctuation


class Command(BaseCommand):
    help = 'Collect English words from the corpus'

    def handle(self, *args, **options):

        # nlp = spacy.load('en_core_web_sm')
        nlp = English()
        tokenizer = Tokenizer(nlp.vocab)

        EnglishWord.objects.all().delete()

        pbar = tqdm(FullTextSearch.objects.all(), desc='Collecting English words')

        for paragraph in pbar:
            for token in tokenizer(paragraph.text_en):
                text = remove_punctuation(token.text.lower())
                obj, created = EnglishWord.objects.get_or_create(
                    word=text,
                )
                if not created:
                    obj.word_count += 1
                    obj.save()
