import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...utils import clear_terminal_line
from .command_utils.utils import get_html
from .update_toc import update_toc
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array
from .constants import PATH
from .process_books import (HAVDALA,
                            PRAYERS,
                            SHABBAT_SONGS,
                            SUPPLEMENTAL,
                            WEDDING_SONGS)
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from ...models import KaraitesBookDetails
from .udpate_bible_ref import update_create_bible_refs


class Command(BaseCommand):
    help = 'Populate Database with Karaites liturgy books as array'

    def handle(self, *args, **options):
        """ Karaites books as array """

        sys.stdout.write('\n Deleting old Karaites liturgy books...\n')
        KaraitesBookDetails.objects.filter(first_level=4).delete()

        for _, book, _, _, _, details, _ in HAVDALA + PRAYERS + SHABBAT_SONGS + WEDDING_SONGS + SUPPLEMENTAL:
            sys.stdout.write(f'\nProcessing book {book}\n')

            book_details, _ = update_book_details(details)

            html = get_html(f'{PATH}{book}')
            html = html.replace('class="a ', 'class="MsoTableGrid ')
            html = html.replace('class="a0 ', 'class="a0 MsoTableGrid ')
            html = html.replace('class="a1 ', 'class="a1 MsoTableGrid ')

            html_tree = BeautifulSoup(html, 'html5lib')

            clear_terminal_line()

            divs = html_tree.find_all('div', {'class': 'WordSection1'})

            table_str = ''
            for table in divs[0].find_all('table'):
                table.attrs = clean_tag_attr(table)
                table = clean_table_attr(table)
                table_str += str(table)
                table.decompose()

            update_karaites_array(book_details, 1, 1, table_str)
            update_book_details(details, introduction=str(divs[0]))
            update_toc(book_details, 2, details['name'].split(','))
            # update/create bible references
            update_create_bible_refs(book_details)

        print()
        print('Done!')
