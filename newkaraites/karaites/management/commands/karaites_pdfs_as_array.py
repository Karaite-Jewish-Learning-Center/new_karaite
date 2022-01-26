"""
   PDFs are converted to html and then processed.
   The conversion is done online https://pdf.online/convert-pdf-to-html
   for the time being no api or other means of conversion is used.
"""
import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from .update_book_details import update_book_details
from .update_karaites_array import update_karaites_array
from .command_utils.read_write_data import (read_data,
                                            write_data)

from .constants import (SOURCE_PATH,
                        OUT_PATH,
                        CSS_SOURCE,
                        CSS_OUT,
                        IGNORE,
                        REMOVE,
                        REMOVE_CSS_CLASS)

# book path
# book name
# language
# post process list of function
# pre-process list of function
# collect css
# start page
# end page
# english_exceptions
PDF_BOOKS = [
    [
        'The Palanquin/', 'The Palanquin.html',
        'he',
        [],
        [],
        # name, Polemic , , Author
        {'name': r"The Palanquin,  ספר מלחמות ה'",
         'first_level': 5,
         'book_classification': '08',
         'author': "Salmon ben Yeruḥim, סלמון בן ירוחים"},
        False,
        5,
        186,
        [6, 7,8,9]
    ],
]


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array'

    def handle(self, *args, **options):
        """

        """
        sys.stdout.write(f"\33[K Loading book's data\r")
        for path, book, language, _, _, details, _, start, end, english_exceptions in PDF_BOOKS:
            book_name = book.replace('.html', '')
            html = read_data(path, book, SOURCE_PATH)
            html_tree = BeautifulSoup(html, 'html.parser')
            book_details, _ = update_book_details(details)

            for page_number in range(start, end + 1):

                for page in html_tree.find_all('div', id=f'page_{page_number}'):

                    if page.attrs.get('class', None) is None:
                        if page_number in english_exceptions:
                            page.attrs['class'] = ['page-english']
                        else:
                            if page_number % 2 == 0:
                                page.attrs['class'] = ['page-hebrew']
                            else:
                                page.attrs['class'] = ['page-english']

                    update_karaites_array(book_details, f'{page_number:04}', 1, str(page))
                    sys.stdout.write(f"\33[K Processing book:{book_name} chapter: {page_number}\r")
                    sys.stdout.flush()
            sys.stdout.write(f"\33[K Process completed book:{book_name}\r")
            print()
