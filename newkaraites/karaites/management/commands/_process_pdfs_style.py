import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .command_utils.read_write_data import (read_data,
                                            write_data)
from .constants import (SOURCE_PATH,
                        OUT_PATH)
from ._list_pdf_books import PDF_BOOKS


class Command(BaseCommand):
    help = 'No help message'

    @staticmethod
    def stats(styles_as_key):
        print()
        print(len(styles_as_key.keys()))
        total = 0
        for key, value in styles_as_key.items():
            total += len(styles_as_key[key])
        print(total)
        print()

    def handle(self, *args, **options):
        """ Process css styles from pdfs
        """
        sys.stdout.write(f"\33[K Loading book's data\r")

        styles_as_key = {}
        for path, book, language, _, _, details, _, start, end, english_exceptions in PDF_BOOKS:
            book_name = book.replace('.html', '')
            html = read_data(path, book, SOURCE_PATH)
            html_tree = BeautifulSoup(html, 'html.parser')
            for style in html_tree.find_all('style'):

                if style is not None:
                    for raw_rule in str(style).split('\n'):

                        rule = raw_rule.strip()
                        # ignore this rules
                        if len(rule) <= 0:
                            continue
                        if rule.startswith('<style'):
                            continue
                        if rule.startswith('</style'):
                            continue

                        # break rule into selector and style
                        selectors, style = rule.split('{')
                        selectors = selectors.strip()
                        style = style.strip()
                        # remove extra spaces
                        selectors = re.sub(r'\s+', ' ', selectors)
                        # create a keu for every style
                        # append ids/classes to the key if they have same style
                        for selector in selectors.split(' '):
                            if style in styles_as_key:
                                styles_as_key[style].append(selector)
                            else:
                                styles_as_key[style] = [selector]
                style.decomposed()

        # uncomment this to see the stats
        # self.stats(styles_as_key)

        # replace repeated styles with a single class/id
        for key, value in styles_as_key.items():
            classes_ids_list = styles_as_key[key]
            # unique classes/ids leave it as it is
            if len(classes_ids_list) > 1:
                continue

            for class_id in classes_ids_list:
                if class_id.startswith('.'):
                    # used the first class name for all the repeated classes styles
                    keep_class = class_id
                    for children in html_tree.find_all(class_=class_id):
                        children.attrs['class'] = keep_class
                elif class_id.startswith('#'):
                    # used the first id name for all the repeated ids styles
                    keep_id = class_id
                    for children in html_tree.find_all(id=class_id):
                        children.attrs['id'] = keep_id

            write_data(path, book,str(html_tree), OUT_PATH)