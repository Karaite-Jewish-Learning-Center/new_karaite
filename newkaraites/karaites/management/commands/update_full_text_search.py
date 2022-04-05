import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (BookAsArray,
                       KaraitesBookDetails,
                       KaraitesBookAsArray,
                       FullTextSearch)
from .update_full_text_search_index import (update_full_text_search_index_en_he,
                                            update_full_text_search_index_english)
from .process_books import HALAKHAH
from langdetect import detect

ENGLISH = 0
HEBREW = 1
VERSE = 4
CHAPTER = 5


class Command(BaseCommand):
    help = 'Update full text search database'

    def handle(self, *args, **options):
        """ 
        """
        sys.stdout.write("\33[K Deleting old data\r")
        # FullTextSearch.objects.all().delete()
        #
        # query = BookAsArray.objects.all()
        # print(f"Processing {query.count()} Chapters")
        #
        # for chapter in query:
        #     sys.stdout.write(f"\33[K Processing book {chapter.book.book_title_en}\r")
        #     for i, verse in enumerate(chapter.book_text):
        #         update_full_text_search_index_en_he(chapter.book.book_title_en,
        #                                             chapter.book.book_title_he,
        #                                             chapter.chapter,
        #                                             i,
        #                                             verse[ENGLISH],
        #                                             verse[HEBREW],
        #                                             'Tanakh')
        #         sys.stdout.write(f"\33[KProcessing chapter: {chapter.chapter} verse: {i}\r")
        #         i += 1

        for path, book, language, _, _, details, _ in HALAKHAH:

            book_title_en, book_title_he = details['name'].split(',')

            book_details = KaraitesBookDetails.objects.get(book_title_en=book_title_en)

            sys.stdout.write(f"\rDeleting full text search for book : {book.replace('-{}.html', '')}\n")

            FullTextSearch.objects.filter(reference_en__startswith=book_title_en).delete()

            update_full_text_search_index_english(book_title_en, 0, book_details.introduction, 'Halakhah')

            for html_fragment in KaraitesBookAsArray.objects.filter(book=book_details, paragraph_number=1):
                html_tree = BeautifulSoup(html_fragment.book_text[1], 'html5lib')
                input('Press Enter to continue...0')
                print(html_fragment.paragraph_number)
                print(html_tree.get_text(strip=False))
                input('Press Enter to continue...')


print()
