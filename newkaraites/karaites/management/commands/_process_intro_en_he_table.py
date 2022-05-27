import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.utils import get_html
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array_language
from .process_books import (HALAKHAH,
                            LANGUAGES_DICT)
from .constants import PATH
from ...models import KaraitesBookDetails
from .udpate_bible_ref import update_create_bible_refs
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.html_utils import remove_empty_tags


class Command(BaseCommand):
    help = 'Populate Database with intro with a table, toc, and book details'

    def handle(self, *args, **options):
        """ Karaites books as array """
        i = 1
        for _, book, language, _, _, details, _ in [HALAKHAH[1]]:
            book_title_en, book_title_he = details['name'].split(',')

            sys.stdout.write(f"\nDeleting book : {book.replace('-{}.html', '')}")
            KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()
            book_details, _ = update_book_details(details, language='en,he')

            for lang in language.split(','):
                book_name = book.replace('{}', LANGUAGES_DICT[lang])
                sys.stdout.write(f'\nProcessing books:')
                sys.stdout.write(f'\n {book_name}')

                html = get_html(f'{PATH}{book_name}')
                # MsoTableGrid is very bad for this book Aaron ben Joseph's
                html = html.replace('MsoTableGrid ', '')
                html_tree = remove_empty_tags(BeautifulSoup(html, 'html5lib'))
                divs = html_tree.find_all('div', class_='WordSection1')

                if lang == 'in':
                    update_book_details(details, introduction=str(divs[0]))
                    continue

                c = 1
                table_str = ''
                for table in divs[0].find_all('table'):
                    table.attrs = clean_tag_attr(table)
                    table = clean_table_attr(table)
                    table_str += str(table)
                    table.decompose()

                if lang == 'en':
                    update_karaites_array_language(book_title_en, '', c, table_str, '')
                if lang == 'he':
                    update_karaites_array_language(book_title_en, '', c, '', table_str)

                if lang in ['en', 'he']:
                    c += 1

            i += 1

        # update/create bible references
        update_create_bible_refs(book_details)
        print()
        print(f'\nDone! processed: {i} books')
