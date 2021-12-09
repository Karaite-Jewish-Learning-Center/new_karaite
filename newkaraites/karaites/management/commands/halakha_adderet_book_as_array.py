import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray,
                       TableOfContents,
                       References)

from ...utils import clear_terminal_line
from ...parser_ref import parse_reference
from .utils import (get_html,
                    mark_bible_refs,
                    ignore_ref,
                    RE_BIBLE_REF
                    )


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    def handle(self, *args, **options):
        """ Karaites books as array """

        print(f'Processing Halakha Adderet')

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

        regular_expression = r'\([^()]*\)'

        html = mark_bible_refs(html)

        html_tree = BeautifulSoup(html, 'html5lib')

        divs = html_tree.find_all('div', class_="WordSection1")

        clear_terminal_line()

        children = divs[0].find_all(recursive=False)
        paragraph_number = 1
        ref_chapter = ''

        for child in children:
            text = child.get_text()

            if text == '\xa0':
                continue

            # if not child.find_all('table'):

            # text = text[0:30].replace('\n', ' ')

            # for toc in table_of_contents:
            #
            #     if text.startswith(toc[0]):
            #         TableOfContents.objects.get_or_create(
            #             karaite_book=book_details,
            #             subject=toc,
            #             start_paragraph=paragraph_number - 1
            #         )
            #         ref_chapter = toc[0]
            #         # update previous record that's the header for chapter
            #         header = KaraitesBookAsArray.objects.get(book=book_details,
            #                                                  paragraph_number=paragraph_number - 1)
            #         header.ref_chapter = ref_chapter
            #         header.book_text = [header.book_text[0], 1]
            #         header.save()
            #         break

            KaraitesBookAsArray.objects.get_or_create(
                book=book_details,
                ref_chapter=ref_chapter,
                paragraph_number=paragraph_number,
                book_text=[str(child), 0],
                foot_notes=[]
            )
            paragraph_number += 1

        # update/create bible references
        for book_text in KaraitesBookAsArray.objects.filter(book_text__iregex=RE_BIBLE_REF):
            for ref in re.findall(regular_expression, book_text.book_text[0]):
                ref_text = BeautifulSoup(ref, 'html5lib').get_text().replace('\n', '').replace('\r', '')
                if ignore_ref(ref_text):
                    continue

                english_ref = parse_reference(ref_text)

                References.objects.get_or_create(
                    karaites_book=book_details,
                    paragraph_number=book_text.paragraph_number,
                    paragraph_text=book_text.book_text,
                    foot_notes=book_text.foot_notes,
                    bible_ref_he=ref_text,
                    bible_ref_en=english_ref,
                )

    print()
