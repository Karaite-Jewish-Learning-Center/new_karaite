import sys
from django.core.management.base import BaseCommand
from ...models import KaraitesBookText
from ...map_ms_html import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate complicate markup from docx to karaites html'

    def handle(self, *args, **options):
        """ Comments"""
        for i, chapter in enumerate(KaraitesBookText.objects.all()):
            sys.stdout.write(
                f"\33[K Rewriting Karaites book chapter: {i}\r")

            chapter.chapter_text = map_docx_to_karaites_html(chapter.chapter_text,
                                                             foot_notes_list=chapter.foot_notes,
                                                             language="he",
                                                             stats=False)
            chapter.chapter_title = map_docx_to_karaites_html(chapter.chapter_title,
                                                              foot_notes_list=[],
                                                              language="he",
                                                              stats=False)

            chapter.save()

        sys.stdout.write(f"\33[K\r")
