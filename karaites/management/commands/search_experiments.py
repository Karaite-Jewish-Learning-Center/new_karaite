from ...models import (Organization,
                       BookAsArray)
from txtai.embeddings import Embeddings
from django.core.management.base import BaseCommand
import os

os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'


class Command(BaseCommand):

    def handle(self, *args, **options):
        questions = ("first day?",
                     "man",
                     "god",
                     "heaven",
                     )
        embeddings = Embeddings({"path": "sentence-transformers/nli-mpnet-base-v2"})
        book = Organization.objects.get(book_title_en='Genesis')
        chapter = BookAsArray.objects.filter(book=book, chapter__gte=1, chapter__lte=3)
        data = []
        for texts in chapter:
            for verse in texts.book_text:
                data.append(verse[0])
        embeddings.index([(uid, {"text": text, "length": len(text)}, None) for uid, text in enumerate(data)])
        # embeddings.index([(uid, text, None) for uid, text in enumerate(data)])

        print("%-20s %s" % ("Query", "Best Match"))
        print("-" * 50)
        # for query in questions:
        #     # Get index of best section that best matches query
        #     uid = embeddings.similarity(query, data)[0][0]

        # print("%-20s %s" % (query, data[uid]))
        query = input("Enter a query: ")
        while query:
            # uid = embeddings.search(query, 1)[0][0]
            results = embeddings.search(f"select text, length, score from txtai where similar('{query}')", 5)
            for uid, score in results:
                print("%-20s \n%s\n%s" % (query, data[uid], score))
            query = input("Enter a query: ")
