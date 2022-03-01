import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.utils import get_html
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array_language
from .process_books import (HALAKHAH,
                            LANGUAGES)
from .constants import PATH
from ...models import KaraitesBookDetails
from .udpate_bible_ref import update_create_bible_refs


class Command(BaseCommand):
    help = 'Populate Database with intro, toc, and book details'

    @staticmethod
    def remove_empty(html_tree):
        for tag in html_tree.find_all():
            if len(tag.get_text(strip=True)) == 0:
                tag.extract()
        return html_tree

    def handle(self, *args, **options):
        """ Karaites books as array """
        i = 1
        for _, book, language, _, _, details, _ in [HALAKHAH[1]]:
            sys.stdout.write(f"\nDeleting book : {book.replace('-{}.html', '')}")
            KaraitesBookDetails.objects.filter(book_title=details['name']).delete()
            book_details, _ = update_book_details(details, language='en,he')

            for lang in language.split(','):
                book_name = book.replace('{}', LANGUAGES[lang])
                sys.stdout.write(f'\nProcessing books:')
                sys.stdout.write(f'\n {book_name}')

                html = get_html(f'{PATH}{book_name}')
                html_tree = self.remove_empty(BeautifulSoup(html, 'html5lib'))
                divs = html_tree.find_all('div', class_='WordSection1')

                c = 1
                for div in divs[0].find_all():

                    if lang == 'en':
                        update_karaites_array_language(details['name'], '', c, str(div), '')
                    if lang == 'he':
                        update_karaites_array_language(details['name'], '', c, '', str(div))

                    if lang in ['en', 'he']:
                        c += 1

                    if lang == 'in':
                        update_book_details(details, introduction=str(div))

            i += 1

        # update/create bible references
        update_create_bible_refs(book_details)
        print()
        print(f'\nDone! processed: {i} books')
