import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    def handle(self, *args, **options):
        """ Karaites books as array """

        source = '../newkaraites/data_karaites/Yeriot Shelomo volume 1.html'

        handle = open(source, 'r')
        html = handle.read()
        handle.close()
        html_tree = BeautifulSoup(html, 'html5lib')
        # html_tree = remove_empty_tags(html_tree)
        divs = html_tree.find_all('div', class_="WordSection1")

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

        # children = divs[0].find_all("p", class_="MsoNormal")
        children = divs[0].find_all(recursive=False)

        page = 0
        paragraph_number = 1
        for child in children:
            if child.get_text() == '\xa0':
                continue

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                page=int(page),
                paragraph_number=paragraph_number,
                book_text=[str(child)],
                foot_notes=[]
            )
            paragraph_number += 1

        # add foot notes
        for paragraph  in KaraitesBookAsArray.objects.filter(book=book_details):
            notes_tree = BeautifulSoup(paragraph.book_text[0], 'html5lib')
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
                    paragraph.foot_notes += [note]
                    paragraph.save()

            # sys.stdout.write(f"\33[K Import Hebrew comments from {book_title}, chapter:{chapter} \r")

        print()
        sys.stdout.write('Please run ./manage.py karaites_book_map_html')
        print()
