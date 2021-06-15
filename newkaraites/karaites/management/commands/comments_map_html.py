import sys
from django.core.management.base import BaseCommand
from ...models import Comment
from ...comments_map import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Translate complicate markup from docx to karaites html'

    def handle(self, *args, **options):
        """ Comments"""
        for i, comment in enumerate(Comment.objects.all()):
            # sys.stdout.write(f"\33[K Rewriting English html comments chapter:{comment.chapter} verse:{comment.verse}\r")

            print(
                f"Rewriting English html comments chapter:{comment.chapter} verse:{comment.verse}, {comment.id}  , {i}")
            comment.comment_en = map_docx_to_karaites_html(comment.comment_he,
                                                           foot_notes_list=comment.foot_notes_he,
                                                           language="en",
                                                           stats=False)
            print('-' * 50)

            comment.save()
        # sys.stdout.write(f"\33[K\r")
