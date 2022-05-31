import sys
from tqdm import tqdm
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.utils import get_html
from .update_book_details import update_book_details
from .update_karaites_array import (update_karaites_array,
                                    update_karaites_array_details,
                                    update_karaites_array_array)

from .update_footnotes import update_footnotes

from .process_books import (COMMENTS,
                            EXHORTATORY,
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
                            LANGUAGES_DICT)
from .constants import PATH
from ...models import (KaraitesBookDetails,
                       FullTextSearch,
                       FullTextSearchHebrew,
                       BooksFootNotes)

from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.argments import arguments
from .command_utils.process_arguments import process_arguments
from .update_full_text_search_index import (update_full_text_search_index_en_he,
                                            update_full_text_search_index_english,
                                            update_full_text_search_index_hebrew)
from .book_intro_toc_end import generate_book_intro_toc_end
from .command_utils.constants import BOOK_CLASSIFICATION_DICT
from ftlangdetect import detect

LIST_OF_BOOKS = (COMMENTS +
                 HALAKHAH +
                 HAVDALA +
                 PASSOVER_SONGS +
                 PURIM_SONGS +
                 PRAYERS +
                 SHABBAT_SONGS +
                 SUPPLEMENTAL +
                 WEDDING_SONGS +
                 POETRY_NON_LITURGICAL +
                 EXHORTATORY +
                 POLEMIC)

LITURGY = (HAVDALA +
           PASSOVER_SONGS +
           PRAYERS +
           PURIM_SONGS +
           SHABBAT_SONGS +
           SUPPLEMENTAL +
           WEDDING_SONGS)


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

    def process_intro(self, book, details, book_title_en, book_title_he):

        html = get_html(f"{PATH}{book.replace('{}', LANGUAGES_DICT['in'])}")
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
        intro += generate_book_intro_toc_end(1)
        update_book_details(details, introduction=intro)

        # update full text search
        intro_html = BeautifulSoup(intro, 'html5lib')
        text_en = intro_html.get_text(strip=False)
        # todo break this in paragraphs pointing to entry 1
        update_full_text_search_index_english(book_title_en,
                                              1,
                                              text_en,
                                              self.expand_book_classification(details))

        update_full_text_search_index_hebrew(book_title_en,
                                             book_title_he,
                                             1,
                                             '',
                                             self.expand_book_classification(details))

    def process_toc(self, book, details, table_of_contents):

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

                        guess = detect(text.replace('\n', ''), low_memory=False)

                        if guess['lang'] == 'he':
                            hebrew = text
                        elif guess['lang'] == 'en':
                            english = text
                        else:
                            print(f"Unknown language:{guess['lang']}")

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

        return table_of_contents

    @staticmethod
    def check_is_a_liturgy_book(book_title_en):

        for _, _, _, _, _, details, _ in LITURGY:
            if book_title_en in details['name']:
                return True

        return False

    @staticmethod
    def process_footnotes(html, details, lang):
        html_tree = BeautifulSoup(html, 'html5lib')
        # find all footnotes by class
        for footnote in html_tree.find_all('span', {'class': f'{lang}-foot-note'}):
            footnote_text = footnote.get('data-tip')
            footnote_ref = footnote.find_all('sup')[0].get_text(strip=True)
            update_footnotes(details, footnote_ref, footnote_text, lang)

    @staticmethod
    def process_liturgy_books(details, lang, book, book_details, book_title_en, book_title_he):

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

        # make book title searchable
        update_full_text_search_index_en_he(book_title_en,
                                            book_title_he,
                                            1,
                                            '',
                                            book_title_en,
                                            book_title_he,
                                            'Liturgy')
        # parse text to pass to full text index search
        text_en = ''
        text_he = ''
        for div in divs[0].find_all('table'):
            trs = div.find_all('tr')
            for tr in trs:
                for td in tr.find_all('td'):
                    text = td.get_text(strip=False)
                    guess = detect(text.replace('\n', ''), low_memory=False)

                    if guess['lang'] == 'he':
                        text_he = f'{text_he} {text}'
                        # book text
                        update_full_text_search_index_hebrew(book_title_en,
                                                             book_title_he,
                                                             1,
                                                             text,
                                                             'Liturgy')
                    elif guess['lang'] == 'en':
                        text_en = f'{text_en} {text}'
                        # book text
                        update_full_text_search_index_english(book_title_en,
                                                              1,
                                                              text,
                                                              'Liturgy')
                    else:
                        print(f'Unknown language:{guess["lang"]}')

        table_str = ''
        for table in divs[0].find_all('table'):
            table.attrs = clean_tag_attr(table)
            table = clean_table_attr(table)
            table_str += str(table)
            table.decompose()

        table_str += generate_book_intro_toc_end(0)
        update_karaites_array_array(book_details, 1, 1, table_str)

        html = str(divs[0]).replace('WordSection1', 'liturgy')
        html += generate_book_intro_toc_end(1)
        update_book_details(details, introduction=html)
        update_toc(book_details, 1, details['name'].split(','))

        # update/create bible references
        update_create_bible_refs(book_details)

    def process_book(self, book, language, details, book_details, book_title_en, book_title_he, table_of_contents):

        table_book = details.get('table_book', False)
        index_lang = details.get('index_lang', '')
        language.split(',')
        c = 1
        for lang in language.split(','):
            if lang == '':
                continue

            book_name = book.replace('{}', LANGUAGES_DICT[lang])
            sys.stdout.write(f'\rProcessing books:{book_name}\n')
            sys.stdout.write(f'\r {book_name}\n')

            html = get_html(f'{PATH}{book_name}')

            self.process_footnotes(html, book_details, lang)

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

                update_karaites_array_details(book_details,
                                              '',
                                              c,
                                              [generate_book_intro_toc_end(0),
                                               0,
                                               generate_book_intro_toc_end(0)])

            elif index_lang:

                # index songs that are basically Hebrew, transliteration to English and English
                divs = html_tree.find_all('div', class_='WordSection1')
                for p in divs[0].find_all('table', recursive=True):
                    p.attrs = clean_tag_attr(p)
                    p = clean_table_attr(p)

                divs = divs[0].find_all('table', recursive=True)
                for tr in divs[0].find_all('tr', recursive=True):
                    child_he = ''
                    child_en = ''
                    for td in tr.find_all('td', recursive=True):

                        text = td.get_text(strip=False)

                        guess = detect(text.replace('\n', ''), low_memory=False)

                        if guess['lang'] == 'he':
                            child_he = str(td)
                            update_full_text_search_index_hebrew(book_title_en, book_title_he, c, text,
                                                                 self.expand_book_classification(details))
                        elif guess['lang'] == 'en':
                            child_en = str(td)
                            update_full_text_search_index_english(book_title_en, c, text,
                                                                  self.expand_book_classification(details))
                        else:
                            print(f'Unknown language:{guess["lang"]} ')

                    update_karaites_array(book_details, '', c, child_he, child_en)
                    c += 1

                update_karaites_array(book_details,
                                      '',
                                      c,
                                      [generate_book_intro_toc_end(0),
                                       generate_book_intro_toc_end(0)])
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

                update_karaites_array_details(book_title_en,
                                              '',
                                              c,
                                              [generate_book_intro_toc_end(0),
                                               ''])

    def handle(self, *args, **options):
        """ Karaites books as array """

        books_to_process = process_arguments(options,
                                             LIST_OF_BOOKS,
                                             COMMENTS,
                                             HALAKHAH,
                                             HAVDALA,
                                             PASSOVER_SONGS,
                                             PURIM_SONGS,
                                             PRAYERS,
                                             POLEMIC,
                                             SHABBAT_SONGS,
                                             WEDDING_SONGS,
                                             SUPPLEMENTAL,
                                             EXHORTATORY,
                                             POETRY_NON_LITURGICAL)

        if not books_to_process:
            return

        pbar = tqdm(books_to_process)
        sys.stdout.write(f"\rProcessing books\n")

        for _, book, language, _, _, details, _ in pbar:
            table_of_contents = {}
            book_title_en, book_title_he = details['name'].split(',')
            KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()
            FullTextSearch.objects.filter(reference_en__startswith=book_title_en).delete()
            FullTextSearchHebrew.objects.filter(reference_en__startswith=book_title_en).delete()
            book_details, _ = update_book_details(details, language='en,he')
            BooksFootNotes.objects.filter(book=book_details).delete()

            if self.check_is_a_liturgy_book(book_title_en):

                self.process_liturgy_books(details, language, book, book_details, book_title_en, book_title_he)

            else:

                if 'in' in language:
                    language = language.replace('in', '')
                    self.process_intro(book, details, book_title_en, book_title_he)

                if 'toc' in language:
                    language = language.replace('toc', '')
                    table_of_contents = self.process_toc(book, details, table_of_contents)

                self.process_book(book, language, details, book_details, book_title_en, book_title_he,
                                  table_of_contents)

                # make book title searchable
                update_full_text_search_index_en_he(book_title_en,
                                                    book_title_he,
                                                    1,
                                                    '',
                                                    book_title_en,
                                                    book_title_he,
                                                    self.expand_book_classification(details))
            # update/create bible references
            update_create_bible_refs(book_details)
