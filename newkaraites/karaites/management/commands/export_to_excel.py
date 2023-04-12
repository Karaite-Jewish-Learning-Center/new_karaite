import sys
from bs4 import BeautifulSoup
from bidi.algorithm import get_display
from django.core.management.base import BaseCommand
from ...models import KaraitesBookAsArray
from openpyxl import Workbook
from openpyxl.styles import Font
from pathlib import Path
from .command_utils.argments import arguments
from .process_arguments import process_arguments

file_name = Path().cwd() / 'exported/'

hebrew_script = {"script": "Hebrew"}


class HebrewScript():
    tagname = "rtl"
    values = ('Hebrew',)


class Command(BaseCommand):
    """Export book from database to excel"""

    def add_arguments(self, parser):
        arguments(parser)

    def handle(self, *args, **options):
        """Export book from database to excel"""
        query = process_arguments(options)
        if not query:
            return

        row = 1
        for q in query:
            title = q.book_title_en
            wb = Workbook()
            ws1 = wb.active
            ws1.title = title
            ws1.column_dimensions['A'].width = 15

            ws1[f'A{row}'] = 'Paragraph'
            ws1[f'B{row}'] = 'Hebrew'
            ws1[f'C{row}'] = 'English'
            ws1[f'D{row}'] = 'footnote Number'
            ws1[f'E{row}'] = 'footnote Hebrew'
            ws1[f'F{row}'] = 'footnote English'

            row += 1
            for book in KaraitesBookAsArray.objects.filter(book__book_title_en=title).order_by('book',
                                                                                               'paragraph_number'):
                html_he = book.book_text[2]
                html_en = book.book_text[0]
                soup_he = BeautifulSoup(html_he, 'html.parser')
                soup_en = BeautifulSoup(html_en, 'html.parser')

                foot_notes_he = ''
                for foot_note in soup_he.find_all('span', {'class': "en-foot-note"}):
                    foot_notes_he += foot_note.get('data-tip').strip().replace('\n', '').replace('\xa0', '') + '\n'

                paragraphs_number = book.paragraph_number

                ws1[f'A{row}'] = paragraphs_number
                ws1[f'B{row}'] = soup_he.get_text()
                ws1[f'C{row}'] = soup_en.get_text()
                ws1[f'D{row}'] = foot_notes_he

                row += 1
                sys.stdout.write(
                    f'\rProcessing book:{book.book.book_title_en}  paragraph:{book.paragraph_number}       ')
                sys.stdout.flush()
            wb.save(file_name / f'{title}.xlsx')
