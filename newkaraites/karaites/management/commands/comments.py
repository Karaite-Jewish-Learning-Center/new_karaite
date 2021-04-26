import json
from django.core.management.base import BaseCommand
from ...models import (BookText,
                       CommentAuthor,
                       Comment)


class Command(BaseCommand):
    help = 'Populate Database with comments'

    def handle(self, *args, **options):
        """ Comments"""

        source = '../newkaraites/data/Tanakh/Commentary/Abarbanel/Abarbanel on Torah'
        file_name = 'merged.json'

        author, _ = CommentAuthor.objects.get_or_create(
            name='Abarbanel'
        )

        json_file = open(f"{source}/English/{file_name}", "r")
        json_data = json_file.read()
        data_en = json.loads(json_data)
        json_file.close()

        json_file = open(f"{source}/Hebrew/{file_name}", "r")
        json_data = json_file.read()
        data_he = json.loads(json_data)
        json_file.close()

        # chapters = data_en['text'].keys()
        # organization.chapters = len(chapters)
        # organization.save()
        #
        # for chapter in chapters:
        #     for verse in data_en['text'][chapter]:
        #         BookText.objects.get_or_create(
        #             book=organization,
        #             chapter=int(chapter) + 1,
        #             verse=int(verse) + 1,
        #             text_en=data_en['text'][chapter][verse],
        #             text_he=data_he['text'][chapter][verse]
        #         )
