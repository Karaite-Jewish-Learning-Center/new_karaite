import json
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookText)
from ...utils import search_level


class Command(BaseCommand):
    help = 'Populate Database with Torah books'

    def handle(self, *args, **options):
        """ Used google translate, please check if this is fine """

        data_map = [{'source': '../newkaraites/data/Tanakh/Torah/',
                     'books': (['Genesis', 'בראשית'],
                               ['Exodus', 'סֵפֶר שֵׁמוֹת'],
                               ['Leviticus', 'סֵפֶר וַיִקְרָא'],
                               ['Numbers', 'מספרים'],
                               ['Deuteronomy', 'ספר דברים'])},

                    {'source': '../newkaraites/data/Tanakh/Prophets/',
                     'books': (['Amos', ''],
                               ['Ezekiel', ''],
                               ['Habakkuk', ''],
                               ['Haggai', ''],
                               ['Hosea', ''],
                               ['I Kings', ''],
                               ['I Samuel', ''],
                               ['II Kings', ''],
                               ['II Samuel', ''],
                               ['Isaiah', ''],
                               ['Jeremiah', ''],
                               ['Joel', ''],
                               ['Jonah', ''],
                               ['Joshua', ''],
                               ['Judges', ''],
                               ['Malachi', ''],
                               ['Micah', ''],
                               ['Nahum', ''],
                               ['Obadiah', ''],
                               ['Zechariah', ''],
                               ['Zephaniah', ''])
                     },
                    {'source': '../newkaraites/data/Tanakh/Writings/',
                     'books': (['Daniel', ''],
                               ['Ecclesiastes', ''],
                               ['Esther', ''],
                               ['Ezra', ''],
                               ['I Chronicles', ''],
                               ['II Chronicles', ''],
                               ['Job', ''],
                               ['Lamentations', ''],
                               ['Nehemiah', ''],
                               ['Proverbs', ''],
                               ['Psalms', ''],
                               ['Ruth', ''],
                               ['Song of Songs', ''])
                     }
                    ]

        file_name = 'merged.json'
        order = 0
        for data in data_map:

            source = data['source']
            books = data['books']
            first_level = search_level(source.split('/')[3])
            second_level = search_level(source.split('/')[4])

            for title_en, title_he in books:

                organization, created = Organization.objects.get_or_create(
                    first_level=first_level,
                    second_level=second_level,
                    book_title_en=title_en,
                    book_title_he=title_he,
                    order=order
                )
                order += 100

                json_file = open(f"{source}/{title_en}/English/{file_name}", "r")
                json_data = json_file.read()
                data_en = json.loads(json_data)
                json_file.close()

                json_file = open(f"{source}/{title_en}/Hebrew/{file_name}", "r")
                json_data = json_file.read()
                data_he = json.loads(json_data)
                json_file.close()

                chapters = data_en['text'].keys()
                organization.chapters = len(chapters)
                organization.save()
                self.stdout.write(f'Importing book: {organization.book_title_en}')

                for chapter in chapters:
                    for verse in data_en['text'][chapter]:
                        BookText.objects.get_or_create(
                            book=organization,
                            chapter=int(chapter) + 1,
                            verse=int(verse) + 1,
                            text_en=data_en['text'][chapter][verse],
                            text_he=data_he['text'][chapter][verse]
                        )
