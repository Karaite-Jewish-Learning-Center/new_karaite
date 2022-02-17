import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

from .constants import PATH
from .process_books import POLEMIC
from .update_toc import update_toc
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array
from .command_utils.utils import get_html
from .command_utils.clean_table import clean_tag_attr
from .udpate_bible_ref import update_create_bible_refs


class Command(BaseCommand):
    help = 'Populate Database with Sefer Milhamot'

    def handle(self, *args, **options):
        """ Sefer Milhamot Karaites book as array """

        for _, book, _, _, _, details, _ in POLEMIC:
            sys.stdout.write(f'\33[K processing book {book}')
            book_details, _ = update_book_details(details)
            html = get_html(f'{PATH}{book}')
            html_tree = BeautifulSoup(html, 'html5lib')

            divs = html_tree.find_all('div', class_="WordSection1")
            remove_class = ['p-116', 'p-117', 'span-258', 'p-118']
            remove_if_text = ['\xa0', 'Name', details['name'][0:5]]
            intro = []
            for children in divs[0].find_all():

                if children.name == 'p' and children.attrs is not None:
                    klass = children.attrs.get('class', None)
                    for remove in remove_class:
                        if remove in klass:
                            text = children.text
                            for t in remove_if_text:
                                if text.startswith(t):
                                    children.decompose()
                                    break

                    if 'p-119' in klass:
                        break

                if children.name is not None:
                    intro.append(str(children))

                children.decompose()

            update_book_details(details, introduction="".join([child for child in intro]))
            table_class = 'sefer-table'
            ref_chapter = 1
            ref_paragraph = 1
            for child in divs[0].find_all('table'):
                child.attrs = clean_tag_attr(child, table_class=table_class)
                for row in child.find_all(recursive=True):
                    row.attrs = clean_tag_attr(row)

            for children in divs[0].find_all(recursive=False):
                if children.name != 'table':
                    update_karaites_array(book_details, ref_chapter, ref_paragraph, str(children))
                if children.name == 'table':
                    table_str = str(children)
                    update_karaites_array(book_details, ref_chapter, ref_paragraph, table_str)
                    children.decompose()
                    continue

                if children.name == 'p' and children.attrs is not None and 'p-120' in children.attrs['class']:
                    update_toc(book_details, ref_paragraph, [children.text, ''])
                    ref_chapter += 1

                ref_paragraph += 1

        # update/create bible references
        update_create_bible_refs(book_details)
        print()
        print('Done')
