import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       TableOfContents,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line
from .html_utils.utils import get_html
from .udpate_bible_ref import update_create_bible_refs


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    @staticmethod
    def parse_toc(html_tree):
        """ parse table of contents """
        print()
        # remove # TOC # End Toc
        i = 1
        for child in html_tree.find_all('span', class_="span-163"):
            if child is not None:
                print('decomposing', i)
                child.decompose()
                i += 1

        toc = []
        for child in html_tree.find_all('span', class_="span-155"):
            if child.get_text == '':
                continue
            toc.append(child.get_text())
            print(child.get_text())
            print()
            print(child)
            input('>>')
        return toc

    def handle(self, *args, **options):
        """ Karaites books as array """

        sys.stdout.write(f"\33[K Processing Halakha Adderet")

        book_title = "Halakha Adderet"
        author, _ = Author.objects.get_or_create(name='Eliyahu R Elijah Bashyatchi')
        author.save()

        book_details, _ = KaraitesBookDetails.objects.get_or_create(
            first_level=3,  # Halakhah
            book_language='he',
            book_classification='03',
            author=author,
            book_title=book_title
        )

        html = get_html(f'../newkaraites/karaites/management/tmp/'
                        f'Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi.html')

        sys.stdout.write(f"\33[K Processing Halakha Adderet bible references")
        html_tree = BeautifulSoup(html, 'html5lib')
        table_of_contents = self.parse_toc(html_tree)
        divs = html_tree.find_all('div', class_="WordSection1")

        clear_terminal_line()

        children = divs[0].find_all(recursive=False)
        paragraph_number = 1
        ref_chapter = ''

        for child in children:
            for span in child.find_all('span', class_='span-160'):

                for toc in table_of_contents:
                    text = span.get_text()

                    if text.startswith(toc[0]):
                        TableOfContents.objects.get_or_create(
                            karaite_book=book_details,
                            subject=toc,
                            start_paragraph=paragraph_number - 1
                        )
                        ref_chapter = toc[0]
                    # update previous record that's the header for chapter
                    header = KaraitesBookAsArray.objects.get(book=book_details,
                                                             paragraph_number=paragraph_number - 1)
                    header.ref_chapter = ref_chapter
                    header.book_text = [header.book_text[0], 1]
                    header.save()
                    break

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                ref_chapter=ref_chapter,
                paragraph_number=paragraph_number,
                book_text=[str(child), 0],
                foot_notes=[]
            )

            paragraph_number += 1
            sys.stdout.write(f"\33[K Processing Halakha Adderet paragraph {paragraph_number}\r")

        # update/create bible references
        # update_create_bible_refs(book_details)


    print()
