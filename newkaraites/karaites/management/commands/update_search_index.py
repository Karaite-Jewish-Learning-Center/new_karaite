# import meilisearch
from ...models import FullTextSearch
from django.core.management.base import BaseCommand


class Command(BaseCommand):

    def handle(self, *args, **options):
        return

        client = meilisearch.Client('http://localhost:7700', 'karaites')
        index_english = client.index('karaites-english')
        index_hebrew = client.index('karaites-hebrew')

        english = []
        hebrew = []
        for obj in FullTextSearch.objects.all():
            english.append({'id': obj.id,
                            'text': obj.text_en,
                            'reference_he': obj.reference_he,
                            'reference_en': obj.reference_en})
            hebrew.append({'id': obj.id,
                           'text': obj.text_he,
                           'reference_he': obj.reference_he,
                           'reference_en': obj.reference_en})

        print('Task uid for English', index_english.add_documents(english))
        print('Task uid for Hebrew', index_hebrew.add_documents(hebrew))
