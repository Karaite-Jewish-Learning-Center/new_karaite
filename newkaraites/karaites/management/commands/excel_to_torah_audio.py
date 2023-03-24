from datetime import datetime
from django.core.files import File
from django.core.management.base import BaseCommand
from ...models import (BookAsArrayAudio,
                       AudioBook)
from openpyxl import load_workbook
import os

FILE_NAME = f'{os.getcwd()}/audioProject/torah_audio.xlsx'
AUDIO_DIR = f'{os.getcwd()}/audioProject/Parashat_bereshit-aliyot-mp3_2023-03-19_1724/'


class Command(BaseCommand):
    """ Read execl import Torah audio"""
    help = 'Import Torah audio from excel.'

    @staticmethod
    def fix_audio_length(time):
        if time is None:
            return None
        if len(time) == 11:
            time = datetime.strptime(time, '%H:%M:%S:%f')
            return time.strftime('%H:%M:%S.%f')[:-3]

    def handle(self, *args, **options):

        wb = load_workbook(FILE_NAME)
        ws = wb['Genesis']
        row = 2

        while True:
            if ws[f'A{row}'].value is None:
                break
            file_name = ws[f'A{row}'].value
            torah_portion = ws[f'B{row}'].value
            traditional_aliyah = ws[f'C{row}'].value
            chapter = ws[f'F{row}'].value
            verse = ws[f'G{row}'].value
            start_time = ws[f'J{row}'].value
            end_time = ws[f'K{row}'].value
            print(f'chapter:{chapter} verse:{verse} start_time:{start_time} end_time:{end_time}')

            try:
                audio_book = AudioBook.objects.get(audio_name=file_name)
            except AudioBook.DoesNotExist:
                audio_book = AudioBook()
                audio_book.audio_name = file_name
                audio_book.audio_file.save(file_name, File(open(f'{AUDIO_DIR}{file_name}', 'rb')))
                audio_book.save()
            row += 1

            book = BookAsArrayAudio.objects.get(book__book_title_en='Genesis', chapter=chapter, verse=verse)
            book.audio = audio_book
            if start_time is not None:
                book.start = self.fix_audio_length(start_time)
            book.end = self.fix_audio_length(end_time)
            book.save()
