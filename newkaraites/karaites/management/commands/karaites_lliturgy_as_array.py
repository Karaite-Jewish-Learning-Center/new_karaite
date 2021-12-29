import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...utils import clear_terminal_line
from .html_utils.utils import get_html
from .udpate_bible_ref import update_create_bible_refs
from process_books import (PATH,
                           LITURGY)
from update_book_details import update_book_details
from update_karaites_array import update_karaites_array


class Command(BaseCommand):
    help = 'Populate Database with Karaites liturgy books as array'

    def handle(self, *args, **options):
        """ Karaites books as array """

        book_details = None
        paragraph_number = 1
        for path, book, _, _, _, details in LITURGY:
            sys.stdout.write(f'\33[K processing book {book}')

            book_details, _ = update_book_details(details)
            html = get_html(f'{PATH}{path}{book}')
            html_tree = BeautifulSoup(html, 'html5lib')
            divs = html_tree.find_all('div', class_="WordSection1")
            clear_terminal_line()
            children = divs[0].find_all(recursive=False)

            ref_chapter = ''
            for child in children:
                update_karaites_array(book_details, ref_chapter, paragraph_number, child)
                paragraph_number += 1

        # update/create bible references
        update_create_bible_refs(book_details)

        print()
        print()
