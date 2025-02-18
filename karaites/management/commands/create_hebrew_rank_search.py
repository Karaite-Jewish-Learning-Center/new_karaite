from tqdm import tqdm
from math import log
from contextlib import contextmanager
from django.core.management.base import BaseCommand
from django.db.models import Sum
from ...models import InvertedIndex


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
    help = 'Create Hebrew Index '

    def handle(self, *args, **options):
        """
           Rank words
        """

        n = InvertedIndex.objects.aggregate(total=Sum(len('documents')))['total']

        pbar = tqdm(InvertedIndex.objects.all())
        for word in pbar:
            word.rank = round(1 / (sum(word.count_by_document) * log(10, (n / len(word.documents)))), 4)
            word.save()
            pbar.set_description(f"Processing rank for Hebrew search")
