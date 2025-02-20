from django.core.management.base import BaseCommand
from django.core.management import call_command
from openpyxl import load_workbook
from pathlib import Path
from ...models import (Songs,
                       FirstLevel,
                       Classification,
                       KaraitesBookAsArray,
                       KaraitesBookDetails,
                       MenuItems,
                       Kedushot)


class Command(BaseCommand):
    help = 'Fill Database details from sheets'

    def handle(self, *args, **options):
        """Import Kedushot and Piyyutim La-Parashiyyot sheets"""

        # call_command('kedushot_add_songs')
        # Do a check if all sheet have the same format
        header = ["File Name",
                  "Pattern",
                  "Hebrew Name",
                  "English Name"
                  "In Place of",
                  "Reciter",
                  "Hebrew Line",
                  "Hebrew Text",
                  "English Transliteration",
                  "English Translation",
                  "Comments",
                  "Time Starting",
                  "Time Ending",
                  "Note"
                  ]
        open_file = Path('karaites/management/commands/kedushot.xlsx')
        wb = load_workbook(open_file)

        # open and process each sheet in the workbook
        for sheet_name in wb.sheetnames:
            if sheet_name.startswith('Index Format') or sheet_name.startswith('DND') or sheet_name.startswith('Info'):
                continue

            self.stdout.write(f"Processing sheet: {sheet_name}")
            ws = wb[sheet_name]  # Set the active worksheet
            abort_on_bad_header = False
            # get the header row
            header_row = ws[1]
            for i, header_item in enumerate(header):
                print("header_row[i]", header_row[i])
                print("header_item", header_item)
                if header_row[i] != header_item:
                    self.stdout.write('-' * 60)
                    self.stdout.write(f"Sheet {sheet_name} has a different format missing {header_item}")
                    self.stdout.write('-' * 60)
                    abort_on_bad_header = True
                    break

        if abort_on_bad_header:
            return

        for sheet_name in wb.sheetnames:
            if sheet_name.startswith('Index Format') or sheet_name.startswith('DND') or sheet_name.startswith('Info'):
                continue
            # skip first row
            for row in ws.iter_rows(min_row=2, values_only=True):
                if row[0] != header[0]:
                    self.stdout.write(f"Sheet {sheet_name} has a different format")
                    break

                song_file_name = row[0]
                pattern = row[1]
                song_name = row[2]
                hebrew_name = row[3]
                english_name = row[4]
                inplace_of = row[5]
                reciter = row[6]
                hebrew_line = row[7]
                hebrew_text = row[8]
                english_transliteration = row[9]
                english_translation = row[10]
                comments = row[11]
                time_end = row[12]

                print('Song file name:', song_file_name)
                print('Pattern:', pattern)
                print('Song name:', song_name)
                print('Hebrew name:', hebrew_name)
                print('English name:', english_name)
                print('Inplace of:', inplace_of)
                print('Reciter:', reciter)
                print('Hebrew line:', hebrew_line)
                print('Hebrew text:', hebrew_text)
                print('English transliteration:', english_transliteration)
                print('English translation:', english_translation)
                print('Comments:', comments)
                print('Time end:', time_end)
                print('-' * 100)
                break
            break
