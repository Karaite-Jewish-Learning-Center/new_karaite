import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.utils import get_html
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array_details
from .process_books import (COMMENTS,
                            POLEMIC,
                            POETRY_NON_LITURGICAL,
                            HALAKHAH,
                            LANGUAGES)
from .constants import PATH
from ...models import (KaraitesBookDetails,
                       FullTextSearch)
from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.html_utils import remove_empty_tags
from .command_utils.argments import arguments
from .command_utils.process_arguments import process_arguments
from .update_full_text_search_index import update_full_text_search_index_en_he

LIST_OF_BOOKS = (COMMENTS +
                 [POLEMIC[1]] +
                 POETRY_NON_LITURGICAL
                 + HALAKHAH)


class Command(BaseCommand):
    help = 'Populate Database with intro, toc, and book details'
    errors = [
        ['".', ''],
        ["'.", ''],
        ["'", ''],
        ["''", ''],
        ['"::', ''],
        ['":', ''],
        [':', ''],
        ['"', ''],
        ['#2.76.', '#2.76'],
        ["'':", ""],
        ['"":', ''],
        ['"', ''],
        [":", ""],
        ["'", ''],
    ]

    def add_arguments(self, parser):
        arguments(parser)

    @staticmethod
    def get_key(text):
        text = text.replace('\n', ' ').strip()
        return text

    @staticmethod
    def break_string_on_hebrew(text):
        text = text.replace('\n', ' ')
        english = ''
        for letter in text:
            if letter in 'אבגדהוזחטיכלמנסעפצקרשת':
                break
            else:
                english += letter
        return english

    def find_toc_key(self, text, debug=False):
        text = text.replace('\n', ' ')
        start = text.find('#')

        if start >= 0:
            key = self.break_string_on_hebrew(text)
            # key = text.strip().replace(' ', '').encode('ascii', errors='ignore').decode('utf-8')

            for error in Command.errors:
                key = key.replace(error[0], error[1])

            value = text.replace('\n', '').replace(key, '').strip()
            if debug:
                print(f'key:{key}  value:{value}')
                input('Press Enter to continue...')

            if key == '':
                return None, None

            return key, value
        return None, None

    def handle(self, *args, **options):
        """ Karaites books as array """
        books_to_process = process_arguments(options,
                                             LIST_OF_BOOKS,
                                             [],
                                             HALAKHAH,
                                             [],
                                             [],
                                             [POLEMIC[1]],
                                             [],
                                             [],
                                             [],
                                             POETRY_NON_LITURGICAL)

        i = 0
        for _, book, language, _, _, details, _ in books_to_process:

            table_of_contents = {}
            book_title_en, book_title_he = details['name'].split(',')
            table_book = details.get('table_book', False)

            sys.stdout.write(f"\rDeleting book : {book.replace('-{}.html', '')}\n")

            KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()
            FullTextSearch.objects.filter(reference_en__startswith=book_title_en).delete()

            book_details, _ = update_book_details(details, language='en,he')

            if 'in' in language:
                language = language.replace('in', '')
                html = get_html(f"{PATH}{book.replace('{}', LANGUAGES['in'])}")
                html_tree = BeautifulSoup(html, 'html5lib')
                html_tree = remove_empty_tags(html_tree)
                divs = html_tree.find_all('div', {'class': 'WordSection1'})

                intro = ''
                for div in divs[0]:
                    if div.name == 'table':
                        div.attrs = clean_tag_attr(div)
                        div = clean_table_attr(div)

                    intro += str(div)
                intro = intro.replace('MsoTableGrid ', '')
                update_book_details(details, introduction=intro)

            if 'toc' in language:
                language = language.replace('toc', '')
                toc = get_html(f"{PATH}/{book.replace('{}', 'TOC')}")
                toc_html = BeautifulSoup(toc, 'html5lib')
                toc_divs = toc_html.find_all('div', class_='WordSection1')
                for p in toc_divs[0].find_all('p'):
                    text = p.get_text(strip=True)
                    key, value = self.find_toc_key(text)
                    if key is not None:
                        table_of_contents[key] = value
            c = 1
            for lang in language.split(','):
                if lang == '':
                    continue

                book_name = book.replace('{}', LANGUAGES[lang])
                sys.stdout.write(f'\rProcessing books:{book_name}\n')
                sys.stdout.write(f'\r {book_name}\n')

                html = get_html(f'{PATH}{book_name}')
                html_tree = remove_empty_tags(BeautifulSoup(html, 'html5lib'))
                divs = html_tree.find_all('div', class_='WordSection1')
                if table_book:
                    table = divs[0].find_all('tr', recursive=True)

                    for tr in table:
                        tr.attrs = clean_tag_attr(tr)
                        tds = tr.find_all('td', recursive=True)
                        for td in tds:
                            td.attrs = clean_tag_attr(td)
                        text_he = tds[0].get_text(strip=True)
                        text_en = tds[1].get_text(strip=True)

                        update_karaites_array_details(book_details, '', c, [str(tds[0]), 0, str(tds[1])])
                        update_full_text_search_index_en_he(book_title_en, book_title_he, c, text_en, text_he)

                        if len(tds) == 3:
                            toc_tex = tds[2].get_text(strip=True)
                            update_toc(book_details, c + 1,
                                       [self.get_key(toc_tex).replace('#', ' ') + ' - ' + text_en, text_he])
                        c += 1
                else:
                    for p in divs[0].find_all(recursive=False):

                        if p.name == 'table':
                            p.attrs = clean_tag_attr(p)
                            p = clean_table_attr(p)

                        text = p.get_text(strip=True)

                        key, value = self.find_toc_key(text, debug=False)
                        p = str(p)

                        if key is not None:
                            p = p.replace('#', '')

                        p = p.replace('MsoTableGrid ', '')
                        update_karaites_array_details(book_title_en, '', c, [p, ''])
                        #update_full_text_search_index_english(book_title_en, c, text)

                        if key is not None:

                            try:
                                update_toc(book_details, c + 1,
                                           [key.replace('#', ' ') + ' - ' + table_of_contents[key], ''])
                            except KeyError:
                                print()
                                print(f'{key}')
                                input('Press enter to continue, key not found')

                        if lang in ['en', 'he']:
                            c += 1
                        sys.stdout.write(f'\r processing paragraph: {c}\r')
                i += 1

            # update/create bible references
            update_create_bible_refs(book_details)
        print()
        print(f'\nDone! processed: {i} books')
