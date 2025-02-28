import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray,
                       FullTextSearch,
                       FullTextSearchHebrew,
                       BookAsArray)
from .utils_update_full_text_search_index import (update_full_text_search_index_english,
                                                  update_full_text_search_index_hebrew,
                                                  update_full_text_search_index_en_he)

from .populate_book_details import (BOOKS_TO_PROCESS,
                                    BOOKS_PATH)

ENGLISH = 0
HEBREW = 1
VERSE = 4
CHAPTER = 5


class Command(BaseCommand):
    help = 'Update full text search database'

    def handle(self, *args, **options):
        """ 
        """
        sys.stdout.write('Processing full text search Biblical books\n')
        sys.stdout.write("\33[K Deleting old data\r")
        FullTextSearch.objects.all().delete()
        FullTextSearchHebrew.objects.all().delete()

        query = BookAsArray.objects.all()
        print(f"Processing {query.count()} Chapters")

        for chapter in query:
            sys.stdout.write(f"\33[K Processing book {chapter.book.book_title_en}\r")
            for i, verse in enumerate(chapter.book_text):
                update_full_text_search_index_en_he(chapter.book.book_title_en,
                                                    chapter.book.book_title_he,
                                                    chapter.chapter,
                                                    i,
                                                    verse[ENGLISH],
                                                    verse[HEBREW],
                                                    'Tanakh')
                sys.stdout.write(f"\33[KProcessing chapter: {chapter.chapter} verse: {i}\r")
                i += 1
        sys.stdout.write('End of processing Biblical books\n')

        sys.stdout.write('Processing full text search Halakhah books\n')

        for book, path in zip(BOOKS_TO_PROCESS, BOOKS_PATH):
            for _, _, _, _, _, details, _ in book:

                book_title_en, book_title_he = details['name'].split(',')
                print(book_title_en)
                print(book_title_he)
                try:
                    book_details = KaraitesBookDetails.objects.get(book_title_en=book_title_en)
                except KaraitesBookDetails.DoesNotExist:
                    print(f"Book {book_title_en} not found")
                    continue

                for html_fragment in KaraitesBookAsArray.objects.filter(book=book_details):

                    english_text = ''
                    hebrew_text = ''

                    # english
                    if html_fragment.book_text[0] != '':

                        html_tree_english = BeautifulSoup(html_fragment.book_text[0], 'html5lib')
                        english_text = html_tree_english.get_text(strip=False)
                        update_full_text_search_index_english(book_title_en,
                                                              html_fragment.paragraph_number,
                                                              english_text,
                                                              path)

                    # hebrew
                    if html_fragment.book_text[2] != '':
                        html_tree_hebrew = BeautifulSoup(html_fragment.book_text[2], 'html5lib')
                        hebrew_text = html_tree_hebrew.get_text(strip=False)
                        update_full_text_search_index_hebrew(book_title_en,
                                                             book_title_he,
                                                             html_fragment.paragraph_number,
                                                             hebrew_text,
                                                             path)

        sys.stdout.write('End of processing\n')
