from django.core.management.base import BaseCommand
from ...models import BookAsArray
from openpyxl import Workbook


class Command(BaseCommand):
    """ Export Torah to excel """
    help = 'Export Torah to excel, there are no site effects'

    def handle(self, *args, **options):
        wb = Workbook()
        for torah_book in ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']:
            ws1 = wb.create_sheet(torah_book)
            ws1.title = torah_book
            ws1.append(['Chapter', 'Verse',  'English', 'hebrew', 'audio'])

            for book in BookAsArray.objects.filter(book__book_title_en=torah_book).order_by('book', 'chapter'):
                i = 0
                for _ in book.book_text:
                    ws1.append([book.chapter, i + 1, book.book_text[i][0], book.book_text[i][1]])
                    print(f' Processing book:{book.book.book_title_en}  chapter:{book.chapter} '
                          f' verse:{i}                  ',
                          end='\r')
                    i += 1

        wb.remove_sheet(wb['Sheet'])
        wb.save('torah.xlsx')
