import sys
from django.core.management.base import BaseCommand
from docx import Document
import pandas as pd
from openpyxl import load_workbook
from ...models import (Songs,
                       LiturgyBook,
                       LiturgyDetails)
from ...models import (KaraitesBookAsArray,
                       KaraitesBookDetails)
from bs4 import BeautifulSoup
from django.core.files import File
from pathlib import Path

path = Path() / 'data_karaites/Word Documents/Liturgy/Havdala Songs/Essa Bechos Yesha‘.docx'



class Command(BaseCommand):
    """ Export LiturgyBooks in karaites model to xls file that should be updated
        and imported to database by LiturgyBooks.py
    """

    def add_arguments(self, parser):
        pass
        # parser.add_argument(
        #     '--xls_file',
        #     default='Liturgy.xlsx',
        #     action='store_true',
        #     help='Update LiturgyBooks table with with excel data file.',
        # )

    @staticmethod
    def extract_intro(file_name):
        doc = Document(file_name)
        introduction = []

        for element in doc.element.body:
            if element.tag.endswith('p'):
                introduction.append(doc.paragraphs[len(introduction)].text)
            elif element.tag.endswith('tbl'):
                break
        return introduction

    @staticmethod
    def read_docx_table(file_name):
        doc = Document(file_name)
        data = []

        for table in doc.tables:
            # Initialize temp_row to None
            temp_row = None

            for i, row in enumerate(table.rows):
                if i % 2 == 0:  # Even
                    temp_row = [cell.text for cell in row.cells]
                    # Adjust for rows with only one column
                    while len(temp_row) < 2:
                        temp_row.append('')
                else:  # Odd
                    temp_row.append(row.cells[0].text if row.cells else '')
                    data.append(temp_row)
                    temp_row = None

            # Check for remaining row if total rows are odd
            if temp_row is not None:
                temp_row.append('')
                data.append(temp_row)

        return data

    def handle(self, *args, **options):
        """ """
        introduction = self.extract_intro(path)
        print(introduction)

        # 1. Read the docx file
        data = self.read_docx_table(path)

        # Create a DataFrame
        df = pd.DataFrame(data, columns=['Even_1', 'Even_2', 'Odd'])

        # Write the DataFrame to an Excel file
        df.to_excel('output.xlsx', index=False)
