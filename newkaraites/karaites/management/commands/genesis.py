import json
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookText)


class Command(BaseCommand):
    help = 'Populate Database with Genesis book'

    def handle(self, *args, **options):
        """ Assumes """
        languages = ('English', 'Hebrew')
        source = '../newkaraites/data/Tanakh/Torah/Genesis/'
        file_name = 'merged.json'
        title_en = "Genesis"
        title_he = "בראשית א׳"
        organization = Organization.objects.get_or_create(
            book_title_en=title_en,
            book_title_he=title_he
        )

        json_file = open(f"{source}/English/{file_name}", "r")
        json_data = json_file.read()
        data = json.loads(json_data)
        print(data['text'].keys())
        print("_" * 10)
        # print(data['text']['0']['0'])

        for chapter in data['text'].keys():
            for verse in data['text'][chapter]:
                print(f"{int(chapter) +1 }, {int(verse) +1 }, {data['text'][chapter][verse]}")
                print("-" * 80)


        # book = BookText.objects.get_or_create(
        #     book=organization,
        #
        # )
