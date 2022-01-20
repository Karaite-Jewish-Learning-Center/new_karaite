import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...utils import clear_terminal_line
from .html_utils.utils import get_html
from .udpate_bible_ref import update_create_bible_refs
from .process_books import (PATH,
                            LITURGY,
                            TEST_BOOKS)
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array
from .update_toc import update_toc
from .clean_table import (clean_tag_attr,
                          clean_table_attr)


class Command(BaseCommand):
    help = 'Populate Database with Karaites liturgy books as array'

    def handle(self, *args, **options):
        """ Karaites books as array """

        for _, book, _, _, _, details, _ in LITURGY + TEST_BOOKS:
            sys.stdout.write(f'\33[K processing book {book}')

            book_details, _ = update_book_details(details)
            html = get_html(f'{PATH}{book}')
            html_tree = BeautifulSoup(html, 'html5lib')

            divs = html_tree.find_all('div', class_="WordSection1")

            clear_terminal_line()

            table = html_tree.find('table')
            table.attrs = clean_tag_attr(table)
            table = clean_table_attr(table)
            table_str = str(table)
            update_karaites_array(book_details, 1, 1, table_str)
            table.decompose()
            children = divs[0].find_all(recursive=False)
            intro = "".join([str(child) for child in children]).replace('en-biblical-ref', 'ref')
            update_book_details(details, introduction=intro)

            update_toc(book_details, 2, details['name'].split(','))
        # update/create bible references
        # update_create_bible_refs(book_details)

        print()
        print()
