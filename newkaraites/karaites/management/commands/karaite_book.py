import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookText)

from ...utils import clear_terminal_line


class Command(BaseCommand):
    help = 'Populate Database with Karaites books at this point is only for the books bellow'

    def handle(self, *args, **options):
        """ Karaites books """
        source = '../newkaraites/data_karaites/Yeriot_Shelomo_Hebrew only.html'

        handle = open(source, 'r')
        html = handle.read()
        handle.close()
        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div')

        clear_terminal_line()

        book_title = "Yeriot Shelomo"
        author, _ = Author.objects.get_or_create(name='Yeriot Shelomo')
        author.save()

        book_details, _ = KaraitesBookDetails.objects.get_or_create(
            book_language='he',
            book_classification='03',
            author=author,
            book_title=book_title
        )

        children = divs[0].find_all("p", class_="MsoNormal")
        end = len(children)
        i = 0
        while i < end:
            child = children[i]
            next_child = child.find_next_sibling()

            if next_child is not None and next_child.attrs.get('align', '') == 'center':
                chapter_raw = str(children[i].text)
                print(chapter_raw)
                chapter_number_la, chapter_number = chapter_raw.split(' ')
                karaites = KaraitesBookText()
                karaites.book = book_details
                karaites.chapter_number = int(chapter_number)
                karaites.chapter_number_la = chapter_number_la
                karaites.chapter_title = str(next_child)
                karaites.chapter_text = ''
                karaites.foot_notes = []
                karaites.save()
                i += 1
            else:
                karaites.chapter_text += str(child)

            karaites.save()
            i += 1

        # add foot notes
        for chapter in KaraitesBookText.objects.filter(book=book_details):
            notes_tree = BeautifulSoup(chapter.chapter_text, 'html5lib')
            unique = {}
            for fn in notes_tree.find_all("span", class_="MsoFootnoteReference"):
                fn_id = fn.text.replace('[', '').replace(']', '')
                if fn_id in unique:
                    continue
                unique[fn_id] = True

                notes = html_tree.find("div", {"id": f"ftn{fn_id}"})
                if hasattr(notes, 'text'):
                    note = re.sub('\\s+', ' ', notes.text.replace('&nbsp;', ' '))
                    if note.startswith(' '):
                        note = note[1:]
                    chapter.foot_notes += [note]
                    chapter.save()

            # sys.stdout.write(f"\33[K Import Hebrew comments from {book_title}, chapter:{chapter} \r")

        print()
        sys.stdout.write('Please run ./manage.py comments_map_html')
        print()
