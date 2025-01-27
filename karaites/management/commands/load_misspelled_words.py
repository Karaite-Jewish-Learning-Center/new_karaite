from tqdm import tqdm
from django.core.management.base import BaseCommand
from ...models import MisspelledWord


class Command(BaseCommand):
    """ source https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings/For_machines"""
    def handle(self, *args, **options):
        MisspelledWord.objects.all().delete()
        '/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/English-resources/misspelled.txt'
        with open('../newkaraites/English-resources/misspelled.txt', 'r') as f:
            for line in tqdm(f, desc='Loading misspelled words'):
                misspelled_word, correct_word = line.strip().split('->')
                MisspelledWord.objects.create(misspelled_word=misspelled_word,
                                              correct_word=correct_word)
