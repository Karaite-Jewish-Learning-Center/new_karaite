import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       TableOfContents,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line
from .html_utils.utils import get_html
from .udpate_bible_ref import update_create_bible_refs

SINGLE = re.compile('\\xa0+')


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    @staticmethod
    def parse_toc(html_tree):
        """ parse table of contents """

        print()
        toc = []
        record_toc = False
        delete_childs =[]
        for p_child in html_tree.find_all('p'):
            if record_toc:
                text = p_child.get_text().replace('\n', ' ')
                if text not in ['\xa0', '# END TOC', ' # End TOC']:
                    toc.append((re.sub(SINGLE, ',', text).split(',')))
                    delete_childs.append(p_child )

            for child in p_child.find_all(recursive=True):

                if hasattr(child, 'attrs'):
                    if child.attrs.get('class', '') == ['span-163']:
                        text_flag = child.get_text().replace('\n', ' ').replace(chr(160), '')
                        if text_flag == '# TOC':
                            record_toc = True
                        elif text_flag.lower().strip() in ['# end toc']:
                            for d in delete_childs:
                                d.decompose()
                            record_toc = False
                            break
                        elif text_flag == '':
                            continue
                        else:
                            print(text_flag)
                            print('Something went wrong!')

        # remove # TOC # End Toc
        for child in html_tree.find_all('span', class_="span-163"):
            if child is not None:
                child.decompose()

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
                    # print('text', text)
                    # print('starts', text.startswith(toc[0]))
                    # print(toc[0])
                    # input('>>')
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
                        table_of_contents.pop(0)
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
