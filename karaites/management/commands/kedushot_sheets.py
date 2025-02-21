from django.core.management.base import BaseCommand
from django.core.management import call_command
from openpyxl import load_workbook
from pathlib import Path
from django.contrib.auth.models import User
from ...models import (Songs,
                       FirstLevel,
                       Classification,
                       KaraitesBookAsArray,
                       KaraitesBookDetails)


class Command(BaseCommand):
    help = 'Fill Database details from sheets'

    def handle(self, *args, **options):
        """Import Kedushot and Piyyutim La-Parashiyyot sheets"""

        # call_command('kedushot_add_songs')
        open_file = Path('karaites/management/commands/kedushot.xlsx')
        wb = load_workbook(open_file)
        law = FirstLevel.objects.get(name='Prayers & Songs')
        classification = Classification.objects.get(name='Kedushot and Piyyutim La-Parashiyyot')
        book_language = 'he-en'
        user = User.objects.get(username='System')
        # open and process each sheet in the workbook
        for sheet_name in wb.sheetnames:
            # Skip unwanted sheets
            if sheet_name.startswith('Index Format') or sheet_name.startswith('DND') or sheet_name.startswith('Info'):
                continue

            # Get the worksheet
            ws = wb[sheet_name]

            # Get the header row to check format
            header = [cell.value for cell in ws[1]]

            # read the second  row
            for row in ws.iter_rows(min_row=2, max_row=2, values_only=True):
                # Unpack row values
                song_name = row[0].value.replace(' ', '_')+'.mp3'
                pattern = row[1].value
                song_name = row[2].value
                hebrew_name = row[3].value
                english_name = row[4].value
                inplace_of = row[5].value
                reciter = row[6].value
                hebrew_line = row[7].value
                hebrew_text = row[8].value
                english_transliteration = row[9].value
                english_translation = row[10].value
                comments = row[11].value
                audio_end = row[12].value

                # create details instance
                instance, created = KaraitesBookDetails.objects.get_or_create(
                    first_level=law,
                    classification=classification,
                    book_language=book_language,
                    author='',
                    book_title_en=english_name,
                    book_title_he=hebrew_name,
                    user=user,
                    better_book=True,

                )
                censored = 0
                break_point = 0
                audio_start = 0
                song_ends = 0
                song_ref = Songs.objects.get(song_title=song_name)
                # read rest of the rows
                for row in ws.iter_rows(min_row=2, max_row=ws.max_row, values_only=True):
                    if row[8].value is None:
                        break

                    reciter = row[6].value
                    hebrew_line = row[7].value
                    hebrew_text = row[8].value
                    english_transliteration = row[9].value
                    english_translation = row[10].value
                    comments = row[11].value
                    audio_end = row[12].value

                    KaraitesBookAsArray.objects.get_or_create(
                        karaites_book_details=instance,
                        song=song_ref,
                        book_text=[hebrew_text,
                                   english_transliteration,
                                   english_translation,
                                   audio_start,
                                   audio_end,
                                   song_ref.id,
                                   reciter,
                                   censored,
                                   hebrew_line,
                                   break_point,
                                   song_ends,
                                   comments,
                                   pattern,
                                   ],
                        line_number=hebrew_line,
                    )
                    audio_start = audio_end

                    # patterns ['Continuous, until Hazzan', 'Quatrain', 'A', 'Couplet']
