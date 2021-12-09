import sys
from django.core.management.base import BaseCommand
from ...models import Comment
from newkaraites.karaites.management.commands.map_ms_html import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate complicate markup from docx to karaites html'

    def handle(self, *args, **options):
        """ Comments"""
        for i, comment in enumerate(Comment.objects.all()):
            sys.stdout.write(
                f"\33[K Rewriting English html comments chapter:{comment.chapter} verse:{comment.verse} , {i}\r")

            comment.comment_en = map_docx_to_karaites_html(comment.comment_en,
                                                           foot_notes_list=comment.foot_notes_en,
                                                           language="en",
                                                           stats=False)
            comment.save()

        for i, comment in enumerate(Comment.objects.all()):
            sys.stdout.write(
                f"\33[K Rewriting Hebrew html comments chapter:{comment.chapter} verse:{comment.verse} , {i}\r")

            comment.comment_he = map_docx_to_karaites_html(comment.comment_he,
                                                           foot_notes_list=comment.foot_notes_he,
                                                           language="he",
                                                           stats=False)
            comment.save()

        sys.stdout.write(f"\33[K\r")
