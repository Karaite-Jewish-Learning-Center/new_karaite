import sys
from ...models import FullTextSearch
from elasticsearch import Elasticsearch
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """ Create elasticsearch index for English """

    def handle(self, *args, **options):
        es = Elasticsearch()
        # simple index creation for english
        english = {
            "settings": {
                "index": {
                    "analysis": {
                        "filter": {
                            "stemmer": {
                                "type": "stemmer",
                                "language": "english"
                            },
                            "autocompleteFilter": {
                                "max_shingle_size": "4",
                                "min_shingle_size": "2",
                                "type": "shingle"
                            },
                            "stopwords": {
                                "type": "stop",
                                "stopwords": ["_english_"]
                            }
                        },
                        "analyzer": {
                            "didYouMean": {
                                "filter": ["lowercase"],
                                "char_filter": ["html_strip"],
                                "type": "custom",
                                "tokenizer": "standard"
                            },
                            "autocomplete": {
                                "filter": ["lowercase", "autocompleteFilter"],
                                "char_filter": ["html_strip"],
                                "type": "custom",
                                "tokenizer": "standard"
                            },
                            "default": {
                                "filter": ["lowercase", "stopwords", "stemmer"],
                                "char_filter": ["html_strip"],
                                "type": "custom",
                                "tokenizer": "standard"
                            }
                        }
                    }
                }
            }
        }
        es.indices.create(index='english', ignore=400, body=english)

        # Get all the documents
        i = 0
        documents = FullTextSearch.objects.all()[:100]
        count = documents.count()
        for document in documents:
            doc = document.to_dict()
            es.index(index='english', doc_type='document', id=document.id, body=doc)
            i += 1
            sys.stdout.write(f'\rIndexed {i} documents of {count}  ')

        es.indices.refresh(index='english')
        print()
        print('Indexing complete')
