import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBook)

from ...html_utils import (get_chapter_verse_en,
                           get_chapter_verse_he,
                           get_foot_note_index)

from ...utils import clear_terminal_line


class Command(BaseCommand):
    help = 'Populate Database with Karaites books at this point is only for the books bellow'

    @staticmethod
    def get_foot_notes(divs):

        end = len(divs)
        foot_notes = {}
        for note in divs[1:end]:
            foot_notes[get_foot_note_index(note)] = note.text
        return foot_notes

    @staticmethod
    def get_a_tag_in_child(child, foot_notes):
        foot_note_list = []
        for a_tag in child.find_all('a'):
            try:
                foot_note_number = int(a_tag.attrs['href'].replace('#_ftn', ''))
                foot_note_list.append(foot_notes[foot_note_number].strip())
            except KeyError:
                pass
        return foot_note_list

    def handle(self, *args, **options):
        """ Karaites books """
        source = '../newkaraites/data_karaites/Yeriot_Shelomo_Hebrew_only.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()
        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div')
        # foot_notes_he = self.get_foot_notes(divs)

        clear_terminal_line()

        book_title = "Yeriot Shelomo"
        author, _ = Author.objects.get_or_create(name='Yeriot Shelomo')
        author.save()

        chapter_number = None
        chapter_title = None

        for child in divs[0].find_all("p", class_="MsoNormal"):
            # chapter
            if child.select_one('.MsoNormal span:first-child'):
                chapter_number = child.text
                continue

            if child.select_one('.MsoNormal b:first-child span:first-child'):
                if chapter_title is not None:
                    karaites = KaraitesBook()
                chapter_title = child.text

                continue

            sys.stdout.write(f"\33[K Import Hebrew comments from {book_title}, chapter:{chapter_number} \r")

        print()
        sys.stdout.write('Please run ./manage.py comments_map_html')
        print()
