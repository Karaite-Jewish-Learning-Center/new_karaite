from tqdm import tqdm
from spacy.tokenizer import Tokenizer
from spacy.lang.en import English
from django.core.management.base import BaseCommand
from ...models import (EnglishWord,
                       FullTextSearch)
from django.db.models.signals import post_save, post_delete
from .command_utils.utils import remove_punctuation
from contextlib import contextmanager


@contextmanager
def disable_signals(signal, sender):
    """
        Disable signals for the given signal and sender
        So that cache is not cleared at every save or delete
    """
    # Get all receivers for this signal and sender
    receivers = signal.receivers[:]
    # Disconnect all receivers
    signal.receivers = []
    try:
        yield
    finally:
        # Restore original receivers
        signal.receivers = receivers


class Command(BaseCommand):
    help = 'Collect English words from the corpus'

    def handle(self, *args, **options):

        # nlp = spacy.load('en_core_web_sm')
        nlp = English()
        tokenizer = Tokenizer(nlp.vocab)

        with disable_signals(post_save, EnglishWord):
            with disable_signals(post_delete, EnglishWord):
                EnglishWord.objects.all().delete()

                pbar = tqdm(FullTextSearch.objects.all(), desc='Collecting English words')

                for paragraph in pbar:
                    for token in tokenizer(paragraph.text_en):
                        text = remove_punctuation(token.text.lower())

                        if text == '':
                            continue

                        obj, created = EnglishWord.objects.get_or_create(
                            word=text,
                        )
                        if not created:
                            obj.word_count += 1
                            obj.save()
