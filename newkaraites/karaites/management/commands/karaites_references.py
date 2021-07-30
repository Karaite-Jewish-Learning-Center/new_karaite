import sys
import re
from typing import KeysView
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray,
                       References)
from hebrew_numbers import gematria_to_int


class Command(BaseCommand):
    help = 'Populate Database with Karaites books references to Bible books'
    hebrew_book_names = {
        'בראשית': 'Genesis',
        'שמות': 'Exodus',
        'ויקרא': 'Leviticus',
        'במדבר': 'Numbers',
        'דברים': 'Deuteronomy',
        'עמוס': 'Amos',
        'יחזקאל': 'Ezekiel',
        'חבקוק': 'Habakkuk',
        'חגי': 'Haggai',
        'הושע': 'Hosea',
        'מלכים א': 'I Kings',
        'שמואל א': 'I Samuel',
        'מלכים ב': 'II Kings',
        'שמואל ב': 'II Samuel',
        'ישעיה': 'Isaiah',
        'ישעיהו': 'Isaiah',  # typo ?
        'ירמיה': 'Jeremiah',
        'ירמיהו': 'Jeremiah',  # typo ?
        'יואל': 'Joel',
        'יונה': 'Jonah',
        'יהושע': 'Joshua',
        'שופטים': 'Judges',
        'מלאכי': 'Malachi',
        'מיכה': 'Micah',
        'נחום': 'Nahum',
        'עובדיה': 'Obadiah',
        'זכריה': 'Zechariah',
        'צפניה': 'Zephaniah',
        'דניאל': 'Daniel',
        'קהלת': 'Ecclesiastes',
        'אסתר': 'Esther',
        'עזרא': 'Ezra',
        'דברי הימים א': 'I Chronicles',
        'דברי הימים ב': 'II Chronicles',
        'איוב': 'Job',
        'איכה': 'Lamentations',
        'נחמיה': 'Nehemiah',
        'משלי': 'Proverbs',
        'תהלים': 'Psalms',  # possible typo
        'תהילים': 'Psalms',
        'רות': 'Ruth',
        'שיר השירים': 'Song of Songs'
    }

    def parse_reference(self, ref):

        parts = ref.replace('(', '').replace(')', '').split(' ')

        if len(parts) == 3:
            book, chapter, verse = parts

            try:
                # some thing that I don't understand, maybe a bug in the library
                chapter_arabic = gematria_to_int(chapter)
                if chapter_arabic > 149:
                    chapter_arabic = int(chapter_arabic / 1000)
                print(
                    f'{self.hebrew_book_names[book]} -{gematria_to_int( chapter)}- {chapter_arabic}:{gematria_to_int(verse)} ->  {ref}')
            except KeyError:
                print(f'Book {book} not found !   ({ref})')

    def handle(self, *args, **options):

        # search for biblical references
        for paragraph in KaraitesBookAsArray.objects.all():
            html_tree = BeautifulSoup(paragraph.book_text[0], 'html5lib')

            references = html_tree.find_all('span', class_='biblical-ref')

            for ref in references:
                self.parse_reference(ref.get_text())
