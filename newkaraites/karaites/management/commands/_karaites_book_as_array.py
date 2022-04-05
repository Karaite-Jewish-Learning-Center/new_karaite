import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line
from .udpate_bible_ref import update_create_bible_refs
from newkaraites.karaites.management.commands.update_toc import update_toc
from .command_utils.utils import get_html


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    @staticmethod
    def parse_toc(html_tree, volume):
        # parse table of contents
        if volume == 1:
            # 4 found experimenting volume 1
            table_number = 4
        else:
            # 0 found experimenting volume 2
            table_number = 0

        toc = []
        table = html_tree.find_all('table')[table_number]
        td = table.find_all('td')
        i = 0
        while i < len(td) - 1:
            subject = td[i].get_text().replace('\n', '').replace('\xa0', '').strip()
            i += 1
            toc.append([subject, td[i].get_text().strip()])
            i += 1
        return toc

    @staticmethod
    def book_title(volume):
        hebrew = " יריעות שלמה"
        return f"Yeriot Shelomo Volume {volume}", hebrew

    def handle(self, *args, **options):
        """ Karaites books as array """
        for volume in [1, 2]:
            try:
                book_details = KaraitesBookDetails.objects.get(book_title_en=self.book_title(volume)[0])
                KaraitesBookAsArray.objects.filter(book=book_details).delete()
            except KaraitesBookDetails.DoesNotExist:
                sys.stdout.write(f'\r{self.book_title(volume)[0]} does not exist')
                sys.exit(1)
            sys.stdout.write(f'\rDeleting Karaites books as array for volume {volume}')

        for volume in [1, 2]:
            paragraph_number = 1
            sys.stdout.write(f'\rProcessing volume: {volume}')
            book_title_en, book_title_he = self.book_title(volume)
            author, _ = Author.objects.get_or_create(name='Shelomo Afeida HaKohen')
            author.save()

            book_details, _ = KaraitesBookDetails.objects.get_or_create(
                first_level=3,  # Halakhah
                book_language='he',
                book_classification='03',
                author=author,
                book_title_en=book_title_en,
                book_title_he=book_title_he,
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
