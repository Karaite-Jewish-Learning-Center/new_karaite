import os
from django.core.management.base import BaseCommand
from openpyxl import load_workbook
from ...models import (Songs,
                       LiturgyBook,
                       LiturgyDetails)
from django.core.files import File

PATH = f'{os.getcwd()}data_karaites/HTML/Liturgy/Shabbat Morning Service/Qedushot and Piyyut Parasha/'


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument(
            '--xls_file',
            default='Kedushot_and_Piyyut_Parasha.xlsx',
            action='store_true',
            help='Update LiturgyBooks table with with excel data file.',
        )

    def handle(self, *args, **options):
        """ Read excel import songs , book text and audio, markers """
        books = ['Atta Qadosh', 'Essa Lamerahoq', 'El Mistatter', 'Adir Venora', 'Ehad Elohenu']
        file_name = f'{PATH}{options["xls_file"]}'
        if not os.path.exists(file_name):
            print(f'File {file_name} does not exist')
            return

        wb = load_workbook(file_name)
        row = 2
        for book in books:
            ws = wb[book]
            # song details
            song_title = ws[f'C{row}'].value
            song_file = ws[f'A{row}'].value
            try:
                song = Songs.objects.get(song_name=song_title)
            except Songs.DoesNotExist:
                songs = Songs()
                songs.song_name = song_title
                songs.song_file.save(song_file, File(open(f'{PATH}{song_file}', 'rb')))
                song.save()

            # LiturgyBooDetails

            # occasion = ws[f'B{row}'].value
            # censored = ws[f'F{row}'].value
            # intro = ws[f'F{row}'].value
            hebrew_name = ws[f'B{row}'].value
            english_name = ws[f'C{row}'].value

            try:
                liturgy_book = LiturgyBook.objects.get(en_name=english_name)
            except LiturgyBook.DoesNotExist:
                liturgy_book = LiturgyBook()

            liturgy_book.hebrew_name = hebrew_name
            liturgy_book.english_name = english_name
            liturgy_book.save()

            row = 2

            while True:
                if ws[f'H{row}'].value is None:
                    break
                censored = []
                reciter = []
                line_number = []
                hebrew_text = []
                english_transliteration = []
                english_text = []
                comments = []
                start_time = []
                end_time = []
                division = ws[f'E{row}'].value.split(';')
                # at this point ignore <new subtext>;
                if len(division) == 2:
                    division = division[1].strip()
                    if division == '<new verse>':
                        next_division = '<end verse>'

                while division != next_division:
                    # line number
                    if ws[f'H{row}'].value is None:
                        break

                    censored.append(ws[f'F{row}'].value)
                    reciter.append(ws[f'G{row}'].value)
                    line_number.append(ws[f'H{row}'].value)
                    hebrew_text.append(ws[f'I{row}'].value)
                    english_transliteration.append(ws[f'J{row}'].value)
                    english_text.append( ws[f'K{row}'].value)
                    comments.append(ws[f'L{row}'].value)
                    start_time.append(ws[f'M{row}'].value)
                    end_time.append(ws[f'N{row}'].value)
                    row += 1

            # save liturgyBook