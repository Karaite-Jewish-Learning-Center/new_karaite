import webbrowser
from django.core.management.base import BaseCommand
from django.core.files import File

from .process_books import (COMMENTS,
                            HALAKHAH,
                            HAVDALA,
                            PASSOVER_SONGS,
                            PURIM_SONGS,
                            PRAYERS,
                            POLEMIC,
                            SHABBAT_SONGS,
                            WEDDING_SONGS,
                            SUPPLEMENTAL,
                            TAMMUZ_AV_ECHA,
                            EXHORTATORY,
                            POETRY_NON_LITURGICAL,
                            LANGUAGES_DICT)

from ...constants import (FIRST_LEVEL_DICT,
                          BOOK_CLASSIFICATION_DICT)

from .constants import SOURCE_PATH
from .process_books import (LIST_OF_BOOKS,
                            LITURGY)
from ...models import (KaraitesBookDetails,
                       Author,
                       Songs)


class Command(BaseCommand):
    """ Populate book details. """

    def handle(self, *args, **options):
        lists_to_process = [
            'COMMENTS',
            'HALAKHAH',
            'HAVDALA',
            'PASSOVER_SONGS',
            'PURIM_SONGS',
            'PRAYERS',
            'POLEMIC',
            'SHABBAT_SONGS',
            'WEDDING_SONGS',
            'SUPPLEMENTAL',
            'TAMMUZ_AV_ECHA',
            'EXHORTATORY',
            'POETRY_NON_LITURGICAL',
        ]
        for process in lists_to_process:
            for book in globals()[process]:
                path, filename, lang, _, _, book_details, _ = book
                book_title_en, book_title_he = book_details['name'].split(',')
                intro = ''
                toc = ''
                lang_in = False
                lang_toc = False

                if 'in' in lang:
                    intro_filename = SOURCE_PATH + path + filename.replace('{}', 'Introduction')
                    intro = File(open(intro_filename, 'rb'), book_title_en)
                    lang_in = True
                if 'toc' in lang:
                    toc_filename = SOURCE_PATH + path + filename.replace('{}', 'TOC')
                    toc = File(open(toc_filename, 'rb'), book_title_en)
                    lang_toc = True

                language = lang.replace(',in', '').replace(',toc', '')
                if language == 'en-he':
                    language = 'he-en'

                source = {'en': '', 'he': ''}
                for lang_code in language.split(','):
                    source_filename = SOURCE_PATH + path + filename.replace('{}', LANGUAGES_DICT[lang_code])
                    if lang_code == 'ja':
                        source['he'] = File(open(source_filename, 'rb'), book_title_en)
                    else:
                        source[lang_code] = File(open(source_filename, 'rb'), book_title_en)

                name, name_he = book_details['author'].split(',')

                author, _ = Author.objects.get_or_create(
                    name=name,
                    name_he=name_he,
                )
                karaites_details, _ = KaraitesBookDetails.objects.get_or_create(
                    book_title_en=book_title_en,
                    defaults={
                        'first_level': book_details['first_level'],
                        'book_classification': book_details['book_classification'],
                        'book_language': language,
                        'intro': lang_in,
                        'toc': lang_toc,
                        'author': author,
                        'book_title_en': book_title_en,
                        'book_title_he': book_title_he,
                        'book_source_en': source['en'],
                        'book_source_he': source['he'],
                        'book_intro_source': intro,
                        'book_toc_source': toc,
                        'table_book': book_details.get('table_book', False),
                        'columns': book_details.get('columns', 0),
                        'columns_order': book_details.get('columns_order', ''),
                        'toc_columns': book_details.get('toc_columns', ''),
                        'direction': book_details.get('direction', 'ltr'),
                        'remove_class': book_details.get('remove_class', ''),
                        'css_class': book_details.get('css_class', ''),
                        'remove_tags': book_details.get('remove_tags', ''),
                        'multi_tables': book_details.get('multi_tables', False),
                        'buy_link': book_details.get('buy_link', ''),
                        'index_lang': book_details.get('index_lang', False),
                    }
                )

                # get song details
                song_path = '../../static/audio/'
                song_path = '/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/karaites/static/audio/'

                for song in book_details.get('song', []):
                    if song == '':
                        continue
                    song_filename = (song_path + song)
                    song_obj, _ = Songs.objects.get_or_create(
                        song_title=song,
                        song_file=File(open(song_filename, 'rb'), name=song),
                    )
                    karaites_details.songs.add(song_obj.id)
                    karaites_details.save()

