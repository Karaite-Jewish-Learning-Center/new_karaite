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
                            HAVDALA,
                            PASSOVER_SONGS,
                            PRAYERS,
                            PURIM_SONGS,
                            SHABBAT_SONGS,
                            SUPPLEMENTAL,
                            WEDDING_SONGS,
                            LANGUAGES)
from .constants import PATH
from ...models import (KaraitesBookDetails,
                       FullTextSearch,
                       FullTextSearchHebrew)

from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.argments import arguments
from .command_utils.process_arguments import process_arguments
from ._update_full_text_search_index import (update_full_text_search_index_en_he,
                                             update_full_text_search_index_english,
                                             update_full_text_search_index_hebrew)
from .command_utils.constants import BOOK_CLASSIFICATION_DICT
from langdetect import (detect,
                        LangDetectException)

LIST_OF_BOOKS = (COMMENTS +
                 POLEMIC +
                 POETRY_NON_LITURGICAL +
                 HALAKHAH +
                 PASSOVER_SONGS +
                 PRAYERS
                 )

# LITURGY = (HAVDALA +
#            PASSOVER_SONGS +
#            PRAYERS +
#            PURIM_SONGS +
#            SHABBAT_SONGS +
#            SUPPLEMENTAL +
#            WEDDING_SONGS)

LITURGY = PASSOVER_SONGS + PRAYERS


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
    def expand_book_classification(details):
        classification = details.get('book_classification', '')
        if classification != '':
            return BOOK_CLASSIFICATION_DICT[classification]
        return ''

    @staticmethod
    def get_key(text):
        text = text.replace('\n', ' ').strip()
        return text

    @staticmethod
    def break_string_on_hebrew(text):
        text = text.replace('\n', ' ').replace('*', '')
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
            value = text.replace(key, ' ').replace('\n', '').strip()

            for error in Command.errors:
                key = key.replace(error[0], error[1])

            key = key.replace(' ', '').replace('-', '').replace('\xa0', '')

            if key.endswith('#'):
                key = f'#{key[:-1]}'

            if debug:
                print(f'text: {text}')
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
                                             COMMENTS,
                                             HALAKHAH,
                                             [],
                                             PASSOVER_SONGS,
                                             PURIM_SONGS,
                                             PRAYERS,
                                             POLEMIC,
                                             [],
                                             [],
                                             [],
                                             POETRY_NON_LITURGICAL)

        if not books_to_process:
            return

        i = 0
        for _, book, language, _, _, details, _ in books_to_process:
            table_of_contents = {}
            book_title_en, book_title_he = details['name'].split(',')
            table_book = details.get('table_book', False)
            index_lang = details.get('index_lang', '')

            sys.stdout.write(f"\rDeleting book : {book.replace('-{}.html', '')}\n")

            KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()
            FullTextSearch.objects.filter(reference_en__startswith=book_title_en).delete()
            FullTextSearchHebrew.objects.filter(reference_en__startswith=book_title_en).delete()
            book_details, _ = update_book_details(details, language='en,he')

            if 'in' in language:
                language = language.replace('in', '')
                html = get_html(f"{PATH}{book.replace('{}', LANGUAGES['in'])}")
                html_tree = BeautifulSoup(html, 'html5lib')
                divs = html_tree.find_all('div', {'class': 'WordSection1'})
                intro = '<div class="liturgy">'
                for div in divs[0]:
                    if div.name == 'table':
                        div.attrs = clean_tag_attr(div)
                        div = clean_table_attr(div)

                    intro += str(div)
                intro = intro.replace('MsoTableGrid ', '')
                intro += '</div>'
                update_book_details(details, introduction=intro)

                # update full text search
                intro_html = BeautifulSoup(intro, 'html5lib')
                text_en = intro_html.get_text(strip=False)
                update_full_text_search_index_english(book_title_en,
                                                      1,
                                                      text_en,
                                                      self.expand_book_classification(details))

                update_full_text_search_index_hebrew(book_title_en,
                                                     book_title_he,
                                                     1,
                                                     '',
                                                     self.expand_book_classification(details))

            if 'toc' in language:

                language = language.replace('toc', '')
                toc = get_html(f"{PATH}/{book.replace('{}', 'TOC')}")
                toc_html = BeautifulSoup(toc, 'html5lib')
                toc_columns = details.get('toc_columns', '')

                if toc_columns:
                    toc_len = len(toc_columns.split(','))
                    toc_index = list(map(int, toc_columns.split(',')))
                    for trs in toc_html.find_all('tr', recursive=True):
                        key, value = None, []
                        hebrew = ''
                        english = ''
                        for index, td in enumerate(trs.find_all('td', recursive=False)):
                            text = td.get_text(strip=False).replace('\xa0', '').replace('\n', '')
                            # two columns in toc
                            if toc_len == 2:
                                if index == 0:
                                    value = text
                                    if value == '':
                                        break
                                if index == 1:
                                    key = text

                            # tree columns in toc
                            if toc_len == 3:
                                # key, hebrew , English
                                if index == toc_index[0]:
                                    key = text
                                    continue

                                lang = detect(text)
                                if lang == 'he':
                                    hebrew = text
                                elif lang == 'en':
                                    english = text
                                else:
                                    print(f'Unknown language:{lang}')

                        if key is not None:
                            if toc_len == 3:
                                table_of_contents[key] = [english, hebrew]
                            else:
                                table_of_contents[key] = [value, '']
                else:
                    for p in toc_html.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                        text = p.get_text(strip=False)

                        key, value = self.find_toc_key(text, debug=False)

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

                # html = html.replace('MsoTableGrid', '')

                if details.get('remove_class', False):
                    html = html.replace(details.get('remove_class'), '')

                if details.get('remove_tags', False):
                    html = html.replace(details.get('remove_tags'), '')

                html_tree = BeautifulSoup(html, 'html5lib')
                divs = html_tree.find_all('div', class_='WordSection1')

                if table_book:
                    table = divs[0].find_all('tr', recursive=True)
                    columns_order = list(map(int, details.get('columns_order', '0,1').split(',')))
                    for tr in table:
                        tr.attrs = clean_tag_attr(tr)
                        tds = tr.find_all('td', recursive=True)
                        for td in tds:
                            td.attrs = clean_tag_attr(td)

                        text_he = ''
                        text_en = ''
                        html_he = ''
                        html_en = ''

                        if 'he' in language:
                            try:
                                text_he = tds[columns_order[0]].get_text(strip=False)
                                html_he = str(tds[columns_order[0]])
                            except IndexError:
                                pass

                        if 'en' in language:
                            try:
                                text_en = tds[columns_order[1]].get_text(strip=False)
                                html_en = str(tds[columns_order[1]])
                            except IndexError:
                                pass

                        if html_he != '' or html_en != '':
                            update_karaites_array_details(book_details,
                                                          '',
                                                          c,
                                                          [html_he, 0, html_en])

                            update_full_text_search_index_en_he(book_title_en,
                                                                book_title_he,
                                                                c,
                                                                '',
                                                                text_en,
                                                                text_he,
                                                                self.expand_book_classification(details))

                        if len(tds) == 3:

                            toc_tex = tds[columns_order[2]].get_text(strip=False)
                            if toc_tex != '':
                                try:
                                    if details.get('toc_columns', False):
                                        key, value = self.find_toc_key(toc_tex, debug=False)

                                        if key is not None:
                                            update_toc(book_details,
                                                       c,
                                                       table_of_contents[key])
                                    else:
                                        update_toc(book_details,
                                                   c,
                                                   [self.get_key(toc_tex).replace('#', ' ') + ' - ' + text_en, text_he])
                                except KeyError:
                                    print(f'{key} not found in table of contents')

                        c += 1
                        sys.stdout.write(f'\r processing paragraph: {c}\r')

                # elif index_lang:
                #
                #     # index songs that are basically Hebrew, transliteration to English and English
                #     divs = html_tree.find_all('div', class_='WordSection1')
                #     for p in divs[0].find_all('table', recursive=True):
                #         p.attrs = clean_tag_attr(p)
                #         p = clean_table_attr(p)
                #
                #
                #     for p in divs[0].find_all('tr', recursive=True):
                #
                #         print(p.get_text(strip=False))
                #         try:
                #
                #             if detect(text) == 'he':
                #                 if lang in ['he']:
                #                     update_full_text_search_index_hebrew(book_title_en, book_title_he, c, text,
                #                                                          self.expand_book_classification(details))
                #                 else:
                #                     update_full_text_search_index_hebrew(book_title_en, book_title_he, c, text,
                #                                                          self.expand_book_classification(details))
                #             p = str(p)
                #             update_karaites_array_details(book_title_en, '', c, [p, ''])
                #             c += 1
                #
                #         except LangDetectException:
                #             pass

                else:

                    divs = html_tree.find_all('div', class_='WordSection1')
                    for p in divs[0].find_all('table', recursive=True):
                        p.attrs = clean_tag_attr(p)
                        p = clean_table_attr(p)
                    for p in divs[0].find_all(recursive=False):
                        text = p.get_text(strip=False)
                        key, value = self.find_toc_key(text, debug=False)

                        p = str(p)

                        if key is not None:
                            p = p.replace('#', '')

                        update_karaites_array_details(book_title_en, '', c, [p, ''])

                        if lang in ['en']:
                            update_full_text_search_index_english(book_title_en, c, text,
                                                                  self.expand_book_classification(details))
                        if lang in ['he']:
                            update_full_text_search_index_hebrew(book_title_en, book_title_he, c, text,
                                                                 self.expand_book_classification(details))

                        if key is not None:
                            try:
                                update_toc(book_details,
                                           c,
                                           [key.replace('#', ' ') + ' - ' + table_of_contents[key], ''])
                            except KeyError:
                                print(f'{key} not found in table of contents')

                        if lang in ['en', 'he', 'ja', 'he-en']:
                            c += 1
                        sys.stdout.write(f'\r processing paragraph: {c}\r')
                i += 1

            # update/create bible references
            update_create_bible_refs(book_details)
        print()
        print(f'\nDone! processed: {i} books')
