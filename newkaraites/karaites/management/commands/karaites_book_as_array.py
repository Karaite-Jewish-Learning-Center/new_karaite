import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray,
                       TableOfContents,
                       References)

from ...utils import clear_terminal_line
from newkaraites.karaites.management.commands.html_utils.parser_ref import parse_reference


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    ignore = ['(#default#VML)',
              '(Web)',
              '("Yeriot%20Shelomo%20volume%201.fld/header.html")',
              '(ששה ימים לאחר שסיים את תפקידיו במצרים)',
              """(כפי שהיה נוהג לעשות זאת בכל הספרים שהיה מעיין בהם)""",
              """(ששה ימים לאחר שסיים את תפקידיו במצרים)""",
              '(ברוך)',
              """(נגד ספר"משא קרים"לאפרים דיינגרד)""",
              """(נגד דת הנצרות)""",
              """(ראה הערה מספר 8)."""
              """(כפי שהיה נוהג לעשות זאת בכל הספרים שהיה מעיין בהם)""",
              """(נגד ספר"משא קרים"לאפרים דיינגרד)"""
              '(בחג הסוכות)',
              '(אַתְּ)',
              '(הֹלֶכֶת)',
              """(ח', י"ט)""",
              """(וְקִבְּלוּ)""",
              """(יַעַשׂ)""",
              # volume 2
              """(ח', י"ט)"""
              '(י"א,  ל"ג),',
              '(יִהְיוּ-) ',
              '(שָׁחוּט)',
              '(דְּבָרוֹ)',
              '(כ"ו, י"ט)',
              '(רַגְלְךָ)',
              '(הוא הנ"ל)',
              '(ח"ב, כ"ג)',
              """(ט', א')""",
              """(ח', י,ט)""",
              """(י"א,ל"ג)""",
              """(יִהְיוּ-)"""]

    def ignore_ref(self, bible_ref):
        if len(bible_ref) > 30:
            return True
        # fix this !
        if bible_ref.find('8') > 0:
            return True
        if bible_ref in self.ignore:
            return True
        return False

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

    def handle(self, *args, **options):
        """ Karaites books as array """

        for volume in [1, 2]:
            paragraph_number = 1

            print(f'Processing volume: {volume}')

            book_title = f"Yeriot Shelomo Volume {volume}"
            author, _ = Author.objects.get_or_create(name='Shelomo Afeida HaKohen')
            author.save()

            book_details, _ = KaraitesBookDetails.objects.get_or_create(
                first_level=3,  # Halakhah
                book_language='he',
                book_classification='03',
                author=author,
                book_title=book_title
            )
            source = (f'../newkaraites/karaites/management/tmp/'
                      f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

            handle = open(source, 'r')
            html = f"""{handle.read()}"""
            handle.close()

            regular_expression = r'\([^()]*\)'

            for bible_ref in re.findall(regular_expression, html):
                if self.ignore_ref(bible_ref):
                    continue

                html = html.replace(bible_ref, f'<span lang="HE" class="he-biblical-ref">{bible_ref}</span>')

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

            # update/create bible references
            for book_text in KaraitesBookAsArray.objects.filter(book_text__iregex=regular_expression):
                for ref in re.findall(regular_expression, book_text.book_text[0]):
                    if self.ignore_ref(ref):
                        continue

                    english_ref = parse_reference(ref)

                    References.objects.get_or_create(
                        karaites_book=book_details,
                        paragraph_number=book_text.paragraph_number,
                        paragraph_text=book_text.book_text,
                        foot_notes=book_text.foot_notes,
                        bible_ref_he=ref,
                        bible_ref_en=english_ref,
                    )

            # add foot notes
            # for paragraph in KaraitesBookAsArray.objects.filter(book=book_details):
            #     notes_tree = BeautifulSoup(paragraph.book_text[0], 'html5lib')
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
            #             paragraph.foot_notes += [note]
            #             paragraph.save()

        print()
        print()
