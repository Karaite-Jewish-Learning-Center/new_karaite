import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)
from .command_utils.utils import get_html
from newkaraites.karaites.management.commands.update_toc import update_toc
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
        delete_child = []
        for p_child in html_tree.find_all('p'):
            if record_toc:
                text = p_child.get_text().replace('\n', ' ')
                if text not in ['\xa0', '# END TOC', ' # End TOC']:
                    toc.append((re.sub(SINGLE, ',', text).split(',')))
                    delete_child.append(p_child)

            for child in p_child.find_all(recursive=True):

                if hasattr(child, 'attrs'):
                    if child.attrs.get('class', '') == ['span-163']:
                        text_flag = child.get_text().replace('\n', ' ').replace(chr(160), '')
                        if text_flag == '# TOC':
                            record_toc = True
                        elif text_flag.lower().strip() in ['# end toc']:
                            for d in delete_child:
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

        hebrew = "אדרת אליהו"
        book_title_en, book_title_he = f"Adderet Eliyahu", hebrew
        author, _ = Author.objects.get_or_create(name='Eliyahu R Elijah Bashyatchi')
        author.save()

        sys.stdout.write(f"\nDeleting old Halakha Adderet\r")
        KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()

        book_details, _ = KaraitesBookDetails.objects.get_or_create(
            first_level=3,  # Halakhah
            book_language='he',
            book_classification='03',
            author=author,
            book_title_en=book_title_en,
            book_title_he=book_title_he,
            introduction="""<p class="MsoNormal"><b>Author: </b>R. Elijah Ben Moshe Bashyachi / ר אליהו בן משה בשיצי</p>
<p class="MsoNormal"><b>Date Written:</b> 15th Century</p>
<p class="MsoNormal"><b>Location: </b>Adrianople / אדריאנופול</p>
<p class="MsoNormal"><b>Edition:</b>The edition presented here uses the 1530-1531 first edition printing, דפוס ראשון, as its base text. Substantive divergences from that text found in the 1835 printing, דפוס א, or the 1870 printing, דפוס ב, are indicated in the footnotes. (Spelling-convention differences which do not affect meaning in any way, such as ענין vs. עניין or שוטה vs סוטה, are not noted.)</p>
<p class="MsoNormal"><b>English Introductory Note:</b>Eliyahu Bashyatzi’s Adderet Eliyahu (continued after his death by his student and brother-in-law Caleb Afendopolo, and originally circulated in handwritten manuscript form) has been published in three previous print editions. The first edition was printed in Constantinople by Gershom Soncino c. 1530-1531, four decades after the primary author’s death. A modern reprinting was done by Abraham Firkovich in 1835 in Gözleve (Eupatoria); another was done by Isaac Beim in 1870 in Odessa. All three printings were available to us as scanned documents; our warmest thanks are extended to Tomer Mangoubi for pointing us to the scan of the first edition.</p>
""",
        )
        book_details.save()

        sys.stdout.write(f"\nProcessing Halakha Adderet\r")

        html = get_html(f'../newkaraites/karaites/management/tmp/'
                        f'Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi.html')

        sys.stdout.write(f"\nProcessing Halakha Adderet bible references\r")
        html_tree = BeautifulSoup(html, 'html5lib')
        table_of_contents = self.parse_toc(html_tree)
        divs = html_tree.find_all('div', class_="WordSection1")

        children = divs[0].find_all(recursive=False)
        paragraph_number = 1
        ref_chapter = ''

        for child in children:
            for span in child.find_all('span', class_='span-160'):

                for toc in table_of_contents:
                    text = span.get_text()

                    if text.startswith(toc[0]):
                        update_toc(book_details, paragraph_number, toc, )
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
            sys.stdout.write(f"\rProcessing Halakha Adderet paragraph {paragraph_number}\r")

        # update/create bible references
        update_create_bible_refs(book_details)

    print()
