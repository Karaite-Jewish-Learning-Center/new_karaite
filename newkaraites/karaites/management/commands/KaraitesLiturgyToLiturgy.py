import sys
from django.core.management.base import BaseCommand
from openpyxl import load_workbook
from ...models import (Songs,
                       LiturgyBook,
                       LiturgyDetails)
from ...models import (KaraitesBookAsArray,
                       KaraitesBookDetails)
from bs4 import BeautifulSoup
from django.core.files import File
from pathlib import Path

path = Path() / 'data_karaites/HTML/Liturgy/Shabbat Morning Services/Qedushot and Piyyut Parasha/'


class Command(BaseCommand):
    """ Export LiturgyBooks in karaites model to xls file that should be updated
        and imported to database by LiturgyBooks.py
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '--xls_file',
            default='Liturgy.xlsx',
            action='store_true',
            help='Update LiturgyBooks table with with excel data file.',
        )

    def handle(self, *args, **options):
        """ """
        #
        # for book in KaraitesBookAsArray.objects.filter(book__first_level__first_level='Liturgy'):
        #     # details
        #     english_name = book.book.book_title_en
        #     hebrew_name = book.book.book_title_he
        #     author = book.book.author
        #     intro = book.book.introduction
        #     toc = book.book.toc
        #     language = book.book.book_language
        #
        #     # book data
        #     for book_ref in KaraitesBookAsArray.objects.filter(book=book.book):
        #         for line in book_ref.book_text:
        #             soup = BeautifulSoup(line, "html5lib")
        #             for el in soup.find_all('p'):
        #                 print(el.get_text())
        #                 input('press enter')

