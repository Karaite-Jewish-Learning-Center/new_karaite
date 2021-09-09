import sys
from django.core.management.base import BaseCommand
from ...models import References
from ...map_ms_html import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate complicate markup from docx to karaites html for  references'

    def handle(self, *args, **options):
        """ Comments"""
        for i, paragraph in enumerate(References.objects.all()):
            sys.stdout.write(
                f"\33[K Rewriting references: {i}\r")

            paragraph.paragraph_text = [map_docx_to_karaites_html(paragraph.paragraph_text[0],
                                                                  foot_notes_list=paragraph.foot_notes,
                                                                  language="he",
                                                                  stats=False),
                                        paragraph.paragraph_text[1]]

            paragraph.save()

        sys.stdout.write("\33[K\r")
