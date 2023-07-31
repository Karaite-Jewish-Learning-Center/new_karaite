# XML tags:
# document = the entire document
# p = a paragraph
# margin = a marginal note
# i = italics
# b = bold
# sc = small caps
# h1 = a chapter title
# sup = superscript
# u = underlined
# quotation = a quotation
# footnote = a footnote
# url = A URL
# green = the part that needs to be typeset in Koren Tanakh
# quran = the part that needs to be typeset in Quranic font

from ...models import (Songs,
                       FirstLevel,
                       Classification,
                       KaraitesBookAsArray,
                       KaraitesBookDetails)
from django.core.management.base import BaseCommand
from xml.etree import ElementTree as ET
from pathlib import Path


class Command(BaseCommand):
    help = 'Populate audio bible books with empty start and stop times'

    def handle(self, *args, **options):
        """ parse XML file """
        language = ['english', 'hebrew', 'arabic']
        path = Path('data_karaites/XML/')
        names = ['rosh-pinna-arabic.xml', 'rosh-pinna-english.xml', 'rosh-pinna-hebrew.xml']

        # the three parts must be combined in one row on
        for name in names:
            with open(path / name, 'r') as file:
                tree = ET.parse(file)

                root = tree.getroot()

                for child in root:
                    if child.tag == 'p':
                        print('Paragraph:', child.text)

                    if child.tag == 'margin':
                        print('Marginal Note:', child.text)

                    if child.tag == 'i':
                        print('Italics:', child.text)

                    if child.tag == 'b':
                        print('Bold:', child.text)

                    if child.tag == 'sc':
                        print('Small Caps:', child.text)

                    if child.tag == 'h1':
                        print('Chapter Title:', child.text)

                    if child.tag == 'sup':
                        print('Superscript:', child.text)

                    if child.tag == 'u':
                        print('Underlined:', child.text)

                    if child.tag == 'quotation':
                        print('Quotation:', child.text)

                    if child.tag == 'footnote':
                        print('Footnote:', child.text)

                    if child.tag == 'url':
                        print('URL:', child.text)

                    if child.tag == 'green':
                        print('Green Text:', child.text)

                    if child.tag == 'quran':
                        print('Quranic Text:', child.text)