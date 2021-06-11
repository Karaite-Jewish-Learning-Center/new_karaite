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
            print(f'{i}' * 50)

            print(f"Rewriting English html comments chapter:{comment.chapter} verse:{comment.verse}")
            print('-' * 50)
            comment.comment_he = map_docx_to_karaites_html(comment.comment_en,
                                                           foot_notes_list=comment.foot_notes_en,
                                                           stats=False)
            print('-' * 50)

            comment.save()
            if i > 20:
                break
        #sys.stdout.write(f"\33[K\r")
