import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.utils import get_html
from .update_toc import update_toc
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array_array
from .process_books import (HAVDALA,
                            PASSOVER_SONGS,
                            PURIM_SONGS,
                            PRAYERS,
                            SHABBAT_SONGS,
                            SUPPLEMENTAL,
                            WEDDING_SONGS)

from .constants import PATH
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from ...models import KaraitesBookDetails
from .udpate_bible_ref import update_create_bible_refs

LIST_OF_BOOKS = (HAVDALA +
                 PRAYERS +
                 PASSOVER_SONGS +
                 PURIM_SONGS +
                 SHABBAT_SONGS +
                 SUPPLEMENTAL +
                 WEDDING_SONGS)


class Command(BaseCommand):
    help = 'Populate Database with Karaites liturgy books as array'

    def handle(self, *args, **options):
        """ Karaites books as array """

        sys.stdout.write('\nDeleting old Karaites liturgy books...\n')
        KaraitesBookDetails.objects.filter(first_level=4).delete()
        sys.stdout.write(f'\nProcessing books:')
        i = 1

        for _, book, lang, _, _, details, _ in LIST_OF_BOOKS:
            sys.stdout.write(f'\n {book.replace(".html", "").replace("-{}", "")}')
            book_details, _ = update_book_details(details)

            if details.get('css_class', None) is not None:
                class_name = f" {details.get('css_class')} "

            if lang.find('he-en') > -1:
                html = get_html(f"{PATH}{book.replace('{}', 'Hebrew-English')}")
            elif lang.find('he') > -1:
                html = get_html(f"{PATH}{book.replace('{}', 'Hebrew')}")
            else:
                html = get_html(f'{PATH}{book}')

            html = html.replace('class="a ', f'class="MsoTableGrid ')
            html = html.replace('class="a0 ', f'class="a0 MsoTableGrid ')
            html = html.replace('class="a1 ', f'class="a1 MsoTableGrid ')

            html = html.replace('class="MsoTableGrid', f'class="MsoTableGrid{class_name}')
            html = html.replace('class="a0 MsoTableGrid', f'class="MsoTableGrid{class_name}')
            html = html.replace('class="a1 MsoTableGrid', f'class="MsoTableGrid{class_name}')
            html_tree = BeautifulSoup(html, 'html5lib')

            divs = html_tree.find_all('div', {'class': 'WordSection1'})

            table_str = ''
            for table in divs[0].find_all('table'):
                table.attrs = clean_tag_attr(table)
                table = clean_table_attr(table)
                table_str += str(table)
                table.decompose()

            update_karaites_array_array(book_details, 1, 1, table_str)
            html = str(divs[0]).replace('WordSection1', 'liturgy')
            update_book_details(details, introduction=html)
            update_toc(book_details, 1, details['name'].split(','))
            # update/create bible references
            update_create_bible_refs(book_details)
            i += 1

        print()
        print(f'\nDone! processed: {i} books')
