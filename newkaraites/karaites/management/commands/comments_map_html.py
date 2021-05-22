import sys
from django.core.management.base import BaseCommand
from ...models import Comment
from ...comments_map import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate complicate markup from docx to karaites html'

    def handle(self, *args, **options):
        """ Comments"""

        for comment in Comment.objects.all():
            comment.comment_en = map_docx_to_karaites_html(comment.comment_en, foot_notes_list=comment.foot_notes)
            comment.save()

        sys.stdout.write(f"\33[K\r")
