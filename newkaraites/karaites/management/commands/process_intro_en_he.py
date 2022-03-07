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
from ...models import KaraitesBookDetails
from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.html_utils import remove_empty_tags

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

    @staticmethod
    def find_toc_key(text):
        text = text.replace('\n', ' ')
        start = text.find('#')
        if start >= 0:
            end_pos = text.find(' ')
            key = text[0:end_pos + 1].strip().encode('ascii', errors='ignore').decode('utf-8')
            for error in Command.errors:
                key = key.replace(error[0], error[1])

            # value_end_pos = text.find('־', end_pos)
            # # print(value_end_pos)
            # if value_end_pos < 0:
            #     value_end_pos = text.find(' ', end_pos + 1)

            value = text[end_pos + 1:].replace('\n', '').strip()

            # print('key: {} value: {} end_pos:{}, value_end_pos:{}'.format(key, value, end_pos, value_end_pos))
            # input('pause')
            if key == '':
                return None, None

            return key, value
        return None, None

    def handle(self, *args, **options):
        """ Karaites books as array """
        i = 1

        for _, book, language, _, _, details, _ in LIST_OF_BOOKS:
            table_of_contents = {}
            book_title_en, book_title_he = details['name'].split(',')

            sys.stdout.write(f"\nDeleting book : {book.replace('-{}.html', '')}")
            KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()
            book_details, _ = update_book_details(details, language='en,he')

            if 'in' in language:
                language = language.replace('in', '')
                html = get_html(f"{PATH}{book.replace('{}', 'introduction')}")
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
                sys.stdout.write(f'\nProcessing books:{book_name}')
                sys.stdout.write(f'\n {book_name}')

                html = get_html(f'{PATH}{book_name}')
                html_tree = remove_empty_tags(BeautifulSoup(html, 'html5lib'))
                divs = html_tree.find_all('div', class_='WordSection1')

                for p in divs[0].find_all(recursive=False):

                    if p.name == 'table':
                        p.attrs = clean_tag_attr(p)
                        p = clean_table_attr(p)

                    text = p.get_text(strip=True)

                    key, value = self.find_toc_key(text)
                    p = str(p)

                    if key is not None:
                        p = p.replace(key, '')

                    p = p.replace('MsoTableGrid ', '')
                    update_karaites_array_details(book_title_en, '', c, p, )

                    if key is not None:
                        try:
                            update_toc(book_details, c + 1,
                                       [key.replace('#', ' ') + ' - ' + table_of_contents[key], ''])
                        except KeyError:
                            print()
                            print(f'{key}')
                            input('press enter to continue')

                    if lang in ['en', 'he']:
                        c += 1
                    sys.stdout.write(f'\r processing paragraph: {c}\r')
            i += 1

        # update/create bible references
        update_create_bible_refs(book_details)
        print()
        print(f'\nDone! processed: {i} books')
