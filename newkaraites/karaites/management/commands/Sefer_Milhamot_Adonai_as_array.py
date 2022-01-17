import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line
from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .html_utils.utils import get_html


class Command(BaseCommand):
    help = 'Populate Database with Sefer Milhamot'

    def handle(self, *args, **options):
        """ Karaites books as array """


        paragraph_number = 1

        sys.stdout.write('\33[K Processing Sefer Milhamot')
        hebrew = " יריעות שלמה"
        book_title = f"Yeriot Shelomo Volume {volume}, {hebrew}"
        author, _ = Author.objects.get_or_create(name='Shelomo Afeida HaKohen')
        author.save()

        book_details, _ = KaraitesBookDetails.objects.get_or_create(
            first_level=3,  # Halakhah
            book_language='he',
            book_classification='03',
            author=author,
            book_title=book_title,
            introduction="""<p class="MsoNormal"><b>Author: </b>R. Shelomo Afeda Ha-Kohen / ר שלמה אפידה הכהן</p>
    <p class="MsoNormal"><b>Date Written:</b> 1860</p>
    <p class="MsoNormal"><b>Location: </b> Constantinople / קושטא</p>
    <p class="MsoNormal"><b>Edition:</b>Ramla 1986</p>
    """
        )
        source = (f'../newkaraites/karaites/management/tmp/'
                  f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

        html = f"""{get_html(source)}"""

        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div', class_="WordSection1")

        clear_terminal_line()

        table_of_contents = self.parse_toc(html_tree, volume)

        children = divs[0].find_all(recursive=False)

        ref_chapter = ''
        for child in children:
            text = child.get_text()

            if text == '\xa0':
                continue

            if not child.find_all('table'):

                text = text[0:30].replace('\n', ' ')

                for toc in table_of_contents:

                    if text.startswith(toc[0]):
                        update_toc(book_details, paragraph_number, toc)
                        break

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                ref_chapter=ref_chapter,
                paragraph_number=paragraph_number,
                book_text=[str(child), 0],
                foot_notes=[]
            )
            paragraph_number += 1

        # update/create bible references
        update_create_bible_refs(book_details)

    print()
    print()
