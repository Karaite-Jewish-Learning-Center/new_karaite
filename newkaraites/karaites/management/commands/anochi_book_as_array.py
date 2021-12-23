import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray,
                       References)

from ...utils import clear_terminal_line
from .html_utils.parser_ref import parse_reference
from .html_utils.utils import (get_html,
                               mark_bible_refs,
                               ignore_ref,
                               RE_BIBLE_REF
                               )
from .udpate_bible_ref import update_create_bible_refs


class Command(BaseCommand):
    help = 'Populate Database with Anochi books as array '

    def handle(self, *args, **options):
        """ Anochi books as array """

        print(f'Processing Anochi')

        book_title = "Anochi Anochi"
        author, _ = Author.objects.get_or_create(name='N/A')
        author.save()

        book_details, _ = KaraitesBookDetails.objects.get_or_create(
            first_level=4,  # Liturgy
            book_language='he',
            book_classification='03',
            author=author,
            book_title=book_title
        )
        html = get_html(f'../newkaraites/karaites/management/tmp/'
                        f'Anochi Anochi.html')

        html = mark_bible_refs(html)

        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div', class_="WordSection1")

        clear_terminal_line()

        children = divs[0].find_all(recursive=False)
        paragraph_number = 1
        ref_chapter = ''

        for child in children:
            text = child.get_text()

            if text == '\xa0':
                continue

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                ref_chapter=ref_chapter,
                paragraph_number=paragraph_number,
                book_text=[str(child), 0],
                foot_notes=[]
            )
            paragraph_number += 1

        # update/create bible references
        update_create_bible_refs(book_details)
    print()
