from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .update_karaites_array import (update_karaites_array,
                                    update_karaites_array_details,
                                    update_karaites_array_array)

from .update_footnotes import update_footnotes
from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray,
                       FullTextSearch,
                       FullTextSearchHebrew,
                       References,
                       BooksFootNotes)

from .update_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .command_utils.clean_table import (clean_tag_attr,
                                        clean_table_attr)
from .command_utils.argments import arguments
from .process_arguments import process_arguments
from .update_full_text_search_index import (update_full_text_search_index_en_he,
                                            update_full_text_search_index_english,
                                            update_full_text_search_index_hebrew)
from .book_intro_toc_end import generate_book_intro_toc_end
from .command_utils.constants import BOOK_CLASSIFICATION_DICT
from ftlangdetect import detect
from .command_utils.utils import roman_to_int


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

    @staticmethod
    def process_intro(book, book_title_en, book_title_he):

        html = book.book_source_intro
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

        book.introduction = intro
        book.save()

        # update full text search
        intro_html = BeautifulSoup(intro, 'html5lib')

        text_en = intro_html.get_text(strip=False)
        # todo break this in paragraphs pointing to entry 1
        update_full_text_search_index_english(book_title_en,
                                              '1/1/intro',
                                              text_en,
                                              book.book_classification.classification_name)

        update_full_text_search_index_hebrew(book_title_en,
                                             book_title_he,
                                             '1/1/intro',
                                             '',
                                             book.book_classification.classification_name)

    def process_toc(self, book, table_of_contents):

        toc = book.book_toc_source
        toc_html = BeautifulSoup(toc, 'html5lib')

        if book.toc_columns:
            toc_len = len(book.toc_columns.split(','))
            toc_index = list(map(int, book.toc_columns.split(',')))
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
                        # else:
                        #     print(f"Unknown language:{guess['lang']}")

                if key is not None:
                    if toc_len == 3:
                        table_of_contents[key.strip()] = [english, hebrew]
                    else:
                        table_of_contents[key.strip()] = [value, '']
        else:
            for p in toc_html.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                text = p.get_text(strip=False)

                key, value = self.find_toc_key(text, debug=False)
                print(f'key:{key}  value:"{value}"')
                if key is not None:
                    table_of_contents[key] = value

        # if settings.DEBUG:
        #     print('Table of Contents:')
        #     print(table_of_contents)
        #     input('Press Enter to continue...')

        return table_of_contents

    @staticmethod
    def check_is_a_liturgy_book(book_title_en):
        return KaraitesBookDetails.objects.filter(book_title_en=book_title_en,
                                                  first_level__first_level='Liturgy').exists()

    @staticmethod
    def foot_notes_numbers(footnote_ref, last_number):
        # some references are Roman numerals, some are Arabic numerals,
        # so we need to convert them to Arabic numerals
        footnote_ref_strip_square_brackets = footnote_ref.replace('[', '').replace(']', '')

        if footnote_ref_strip_square_brackets.isnumeric():
            footnote_number = int(footnote_ref_strip_square_brackets)
        elif footnote_ref_strip_square_brackets.isalpha():
            footnote_number = roman_to_int(footnote_ref_strip_square_brackets)
        else:
            footnote_number = last_number + 1

        return footnote_number

    @staticmethod
    def process_footnotes(html, details, lang):
        html_tree = BeautifulSoup(html, 'html5lib')
        # find all footnotes by class
        last_number = 0
        for footnote in html_tree.find_all('span', {'class': f'{lang}-foot-note'}):
            footnote_text = footnote.get('data-tip')
            footnote_ref = footnote.find_all('sup')[0].get_text(strip=True)
            last_number = Command.foot_notes_numbers(footnote_ref, last_number)
            update_footnotes(details, footnote_ref, footnote_text, last_number, lang)

    @staticmethod
    def process_liturgy_books(book):
        class_name = ''
        if book.css_class != '':
            class_name = f" {book.css_class} "

        html_tree = BeautifulSoup(book.processed_book_source, 'html5lib')
        html = str(html_tree)
        html = html.replace('class="a ', f'class="MsoTableGrid ')
        html = html.replace('class="a0 ', f'class="a0 MsoTableGrid ')
        html = html.replace('class="a1 ', f'class="a1 MsoTableGrid ')

        html = html.replace('class="MsoTableGrid', f'class="MsoTableGrid{class_name}')
        html = html.replace('class="a0 MsoTableGrid', f'class="MsoTableGrid{class_name}')
        html = html.replace('class="a1 MsoTableGrid', f'class="MsoTableGrid{class_name}')
        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div', {'class': 'WordSection1'})

        # make book title searchable
        update_full_text_search_index_en_he(book.book_title_en,
                                            book.book_title_he,
                                            1,
                                            '',
                                            book.book_title_en,
                                            book.book_title_he,
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
                        update_full_text_search_index_hebrew(book.book_title_en,
                                                             book.book_title_he,
                                                             1,
                                                             text,
                                                             'Liturgy')
                    elif guess['lang'] == 'en':
                        text_en = f'{text_en} {text}'
                        # book text
                        update_full_text_search_index_english(book.book_title_en,
                                                              1,
                                                              text,
                                                              'Liturgy')

        table_str = ''
        for table in divs[0].find_all('table'):
            table.attrs = clean_tag_attr(table)
            table = clean_table_attr(table)
            table_str += str(table)
            table.decompose()

        table_str += generate_book_intro_toc_end(0)
        update_karaites_array_array(book, 1, 1, table_str)

        html = str(divs[0]).replace('WordSection1', 'liturgy')
        html += generate_book_intro_toc_end(1)

        book.introduction = html
        book.save()

        # update_book_details(details, introduction=html)
        update_toc(book, 1, [book.book_title_en, book.book_title_he])

        # update/create bible references
        # update_create_bible_refs(book)

    def process_book(self, book, table_of_contents):
        table_book = book.table_book
        index_lang = book.index_lang

        c = 1
        for lang in book.book_language.split(','):
            if lang == '':
                continue

            html = book.processed_book_source

            html_tree = BeautifulSoup(html, 'html5lib')
            html = str(html_tree)

            # self.process_footnotes(html, book_details, lang)

            html = html.replace(book.remove_class, '')
            html = html.replace(book.remove_tags, '')

            html_tree = BeautifulSoup(html, 'html5lib')
            divs = html_tree.find_all('div', class_='WordSection1')
            print('table_book', table_book)
            if table_book:
                table = divs[0].find_all('tr', recursive=True)
                columns_order = list(map(int, book.columns_order.split(',')))
                for tr in table:
                    tr.attrs = clean_tag_attr(tr)
                    tds = tr.find_all('td', recursive=True)
                    for td in tds:
                        td.attrs = clean_tag_attr(td)

                    text_he = ''
                    text_en = ''
                    html_he = ''
                    html_en = ''
                    print('book: ', book.book_language)
                    if 'he' in book.book_language or 'ja' in book.book_language:
                        try:
                            text_he = tds[columns_order[0]].get_text(strip=False)
                            html_he = str(tds[columns_order[0]])
                        except IndexError:
                            pass

                    if 'en' in book.book_language:
                        try:
                            text_en = tds[columns_order[1]].get_text(strip=False)
                            html_en = str(tds[columns_order[1]])
                        except IndexError:
                            pass

                    if html_he != '' or html_en != '':
                        update_karaites_array_details(book,
                                                      '',
                                                      c,
                                                      [html_en, 0, html_he])

                        update_full_text_search_index_en_he(book.book_title_en,
                                                            book.book_title_he,
                                                            c,
                                                            '',
                                                            text_en,
                                                            text_he,
                                                            book.book_classification.classification_name)

                    if len(tds) == 3:

                        toc_tex = tds[columns_order[2]].get_text(strip=False)

                        if toc_tex != '':
                            try:
                                if book.toc_columns != '':
                                    key, value = self.find_toc_key(toc_tex, debug=False)

                                    if key is not None:
                                        update_toc(book,
                                                   c,
                                                   table_of_contents[key])
                                else:
                                    update_toc(book,
                                               c,
                                               [self.get_key(toc_tex).replace('#', ' ') + ' - ' + text_en, text_he])
                            except KeyError:
                                print(f'{key} not found in table of contents, book {book.book_title_en}')

                    c += 1

                update_karaites_array_details(book,
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
                            update_full_text_search_index_hebrew(book.book_title_en, book.book_title_he, c, text,
                                                                 book.book_classification.classification_name)
                        elif guess['lang'] == 'en':
                            child_en = str(td)
                            update_full_text_search_index_english(book.book_title_en, c, text,
                                                                  book.book_classification.classification_name)
                        # else:
                        #     print(f'Unknown language:{guess["lang"]} ')

                    update_karaites_array(book, '', c, child_he, child_en)
                    c += 1

                update_karaites_array(book,
                                      '',
                                      c,
                                      '',
                                      generate_book_intro_toc_end(0))
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

                    if lang in ['en']:
                        update_karaites_array_details(book.book_title_en, '', c, [p, 0, ''])

                        update_full_text_search_index_english(book.book_title_en, c, text,
                                                              book.book_classification.classification_name)
                    if lang in ['he', 'ja']:
                        update_karaites_array_details(book.book_title_en, '', c, ['', 0, p])

                        update_full_text_search_index_hebrew(book.book_title_en, book.book_title_he, c, text,
                                                             book.book_classification.classification_name)

                    if key is not None:
                        try:
                            update_toc(book,
                                       c,
                                       [key.replace('#', ' ') + ' - ' + table_of_contents[key], ''])
                        except KeyError:
                            print(f'{key} not found in table of contents, book {book.book_title_en}')

                    if lang in ['en', 'he', 'ja', 'he-en']:
                        c += 1

                update_karaites_array_details(book.book_title_en,
                                              '',
                                              c,
                                              [generate_book_intro_toc_end(0), 0, ''])

    def handle(self, *args, **options):
        """ Karaites books as array """

        query = process_arguments(options)

        if not query:
            return

        # pbar = tqdm(query, desc='Processing books')

        for book in query:
            table_of_contents = {}
            book_title_en = book.book_title_en
            book_title_he = book.book_title_he
            FullTextSearch.objects.filter(reference_en__startswith=book_title_en).delete()
            FullTextSearchHebrew.objects.filter(reference_en__startswith=book_title_en).delete()
            BooksFootNotes.objects.filter(book=book).delete()
            References.objects.filter(karaites_book=book).delete()
            KaraitesBookAsArray.objects.filter(book=book).delete()

            print(f'processing {book_title_en}')

            if book.intro:
                self.process_intro(book, book_title_en, book_title_he)

            if book.toc:
                table_of_contents = self.process_toc(book, table_of_contents)

            if self.check_is_a_liturgy_book(book_title_en):
                print(f'{book_title_en} ')
                self.process_liturgy_books(book)

            else:

                self.process_book(book, table_of_contents)

                # make book title searchable
                update_full_text_search_index_en_he(book_title_en,
                                                    book_title_he,
                                                    1,
                                                    '',
                                                    book_title_en,
                                                    book_title_he,
                                                    book.book_classification.classification_name)
            # update/create bible references
            update_create_bible_refs(book)
