import sys
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
        for c in children:
            if c.get_text() == '':
                continue

            html = ''
            for x in c.children:
                html += str(x)

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                page=int(page),
                paragraph_number=paragraph_number,
                book_text=[str(c), 0, 0],
                foot_notes=[]
            )
            paragraph_number += 1

        # end = len(children)
        # i = 0
        # is_title = 0
        # page = 18
        # page_hebrew = "עמ'"
        # paragraph_number = 1
        # ignore introduction
        # while i < end and children[i].get_text() != "עמ' 18":
        #     i += 1
        #
        # # stop at part 2
        # start = i
        #
        # while i < end and children[i].get_text() != 'חלק שני':
        #     i += 1
        #
        # end = i - 1
        # i = start
        # while i < end:
        #     child = children[i]
        #     next_child = child.find_next_sibling()
        #
        #     if next_child is not None and next_child.attrs.get('align', '') == 'center':
        #         try:
        #             chapter_raw = child.get_text()
        #             page_hebrew, page = chapter_raw.split(' ')
        #             page = int(page)
        #             is_title = 1
        #         except ValueError:
        #             pass
        #         i += 1
        #         continue
        #
        #     html = str(child)
        #     if child.get_text() != '\xa0':
        #         KaraitesBookAsArray.objects.get_or_create(
        #             book=book_details,
        #             page=int(page),
        #             paragraph_number=paragraph_number,
        #             book_text=[str(html), is_title, page_hebrew],
        #             foot_notes=[]
        #         )
        #         is_title = 0
        #         paragraph_number += 1
        #     i += 1

        # # add foot notes
        # for chapter in KaraitesBookText.objects.filter(book=book_details):
        #     notes_tree = BeautifulSoup(chapter.chapter_text, 'html5lib')
        #     unique = {}
        #     for fn in notes_tree.find_all("span", class_="MsoFootnoteReference"):
        #         fn_id = fn.text.replace('[', '').replace(']', '')
        #         if fn_id in unique:
        #             continue
        #         unique[fn_id] = True
        #
        #         notes = html_tree.find("div", {"id": f"ftn{fn_id}"})
        #         if hasattr(notes, 'text'):
        #             note = re.sub('\\s+', ' ', notes.text.replace('&nbsp;', ' '))
        #             if note.startswith(' '):
        #                 note = note[1:]
        #             chapter.foot_notes += [note]
        #             chapter.save()
        #
        #     # sys.stdout.write(f"\33[K Import Hebrew comments from {book_title}, chapter:{chapter} \r")

        print()
        sys.stdout.write('Please run ./manage.py comments_map_html')
        print()
