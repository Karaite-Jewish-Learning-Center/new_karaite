import json

from django.core.management.base import BaseCommand
from ...models import (Organization,
                       BookAsArray,
                       FullTextSearch,
                       FullTextSearchHebrew)
from ...utils import search_level
from .update_full_text_search_index import update_full_text_search_index_en_he


class Command(BaseCommand):
    help = 'Populate Database with Torah books'

    def handle(self, *args, **options):
        """ Used Google Translate, please check if this is fine """

        data_map = [{'source': '../newkaraites/data/Tanakh/Torah',
                     'books': (['Genesis', 'בראשית'],
                               ['Exodus', 'שמות'],
                               ['Leviticus', 'ויקרא'],
                               ['Numbers', 'במדבר'],
                               ['Deuteronomy', 'דברים'])},

                    {'source': '../newkaraites/data/Tanakh/Prophets',
                     'books': (['Amos', 'עמוס'],
                               ['Ezekiel', 'יחזקאל'],
                               ['Habakkuk', 'חבקוק'],
                               ['Haggai', 'חגי'],
                               ['Hosea', 'הושע'],
                               ['I Kings', 'מלכים א'],
                               ['I Samuel', 'שמואל א'],
                               ['II Kings', 'מלכים ב'],
                               ['II Samuel', 'שמואל ב'],
                               ['Isaiah', 'ישעיה'],
                               ['Jeremiah', 'ירמיה'],
                               ['Joel', 'יואל'],
                               ['Jonah', 'יונה'],
                               ['Joshua', 'יהושע'],
                               ['Judges', 'שופטים'],
                               ['Malachi', 'מלאכי'],
                               ['Micah', 'מיכה'],
                               ['Nahum', 'נחום'],
                               ['Obadiah', 'עובדיה'],
                               ['Zechariah', 'זכריה'],
                               ['Zephaniah', 'צפניה'])
                     },
                    {'source': '../newkaraites/data/Tanakh/Writings',
                     'books': (['Daniel', 'דניאל'],
                               ['Ecclesiastes', 'קהלת'],
                               ['Esther', 'אסתר'],
                               ['Ezra', 'עזרא'],
                               ['I Chronicles', 'דברי הימים א'],
                               ['II Chronicles', 'דברי הימים ב'],
                               ['Job', 'איוב'],
                               ['Lamentations', 'איכה'],
                               ['Nehemiah', 'נחמיה'],
                               ['Proverbs', 'משלי'],
                               ['Psalms', 'תהילים'],
                               ['Ruth', 'רות'],
                               ['Song of Songs', 'שיר השירים'])
                     }
                    ]

        self.stdout.write(f'Deleting Full Text Search index')
        FullTextSearch.objects.filter(path='Tanakh').delete()
        FullTextSearchHebrew.objects.filter(path='Tanakh').delete()
        Organization.objects.all().delete()

        file_name = 'merged.json'
        order = 0
        for data in data_map:

            source = data['source']
            books = data['books']
            first_level = search_level(source.split('/')[3])
            second_level = search_level(source.split('/')[4])

            for title_en, title_he in books:

                organization, created = Organization.objects.get_or_create(
                    first_level=first_level,
                    second_level=second_level,
                    book_title_en=title_en,
                    book_title_he=title_he,
                    order=order
                )
                order += 100

                json_file = open(f"{source}/{title_en}/English/{file_name}", "r")
                json_data = json_file.read()
                data_en = json.loads(json_data)
                json_file.close()

                json_file = open(f"{source}/{title_en}/Hebrew/{file_name}", "r")
                json_data = json_file.read()
                data_he = json.loads(json_data)
                json_file.close()

                chapters = data_en['text'].keys()
                organization.chapters = len(chapters)
                organization.save()

                # just give feed back
                self.stdout.write(f'Importing book: {organization.book_title_en}')
                list_of_verses = []
                for chapter in chapters:
                    book_as_array = []
                    chapter_number = int(chapter) + 1
                    book_chapter = chapter_number
                    #  render a chapter number
                    render_chapter = 1
                    for verse in data_en['text'][chapter]:
                        verse_number = int(verse) + 1

                        book_as_array.append([data_en['text'][chapter][verse],
                                              data_he['text'][chapter][verse],
                                              0,
                                              0,
                                              verse_number,
                                              book_chapter,
                                              render_chapter,
                                              ])
                        render_chapter = 0
                        update_full_text_search_index_en_he(title_en,
                                                            title_he,
                                                            chapter_number,
                                                            verse_number,
                                                            data_en['text'][chapter][verse],
                                                            data_he['text'][chapter][verse],
                                                            'Tanakh')
                    # update book as array
                    BookAsArray.objects.get_or_create(
                        book=organization,
                        chapter=chapter_number,
                        book_text=book_as_array,
                    )

                    list_of_verses.append(verse_number)

                # update verses in organization
                organization.verses = list_of_verses
                organization.total_verses = sum(list_of_verses)
                organization.save()
