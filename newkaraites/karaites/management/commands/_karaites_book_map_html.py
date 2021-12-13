import sys
from django.core.management.base import BaseCommand
from ...models import KaraitesBookAsArray
from .map_ms_html import map_yeriot_shelomo_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate inline style markup from docx to karaites classes style'

    def handle(self, *args, **options):
        """ Comments"""
        for i, paragraph in enumerate(KaraitesBookAsArray.objects.all()):
            sys.stdout.write(
                f"\33[K Rewriting Karaites book chapter: {i}\r")

            paragraph.book_text = [map_yeriot_shelomo_docx_to_karaites_html(paragraph.book_text[0],
                                                                            foot_notes_list=paragraph.foot_notes,
                                                                            language="he",
                                                                            stats=False),
                                   paragraph.book_text[1]]

            paragraph.save()

        sys.stdout.write("\33[K\r")
