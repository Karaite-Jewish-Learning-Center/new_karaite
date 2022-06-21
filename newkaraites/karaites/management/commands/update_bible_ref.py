import re
# import sys
from bs4 import BeautifulSoup
from ...models import (KaraitesBookAsArray,
                       References)
from .command_utils.utils import RE_BIBLE_REF
from .command_utils.parser_ref import parse_reference


def update_create_bible_refs(book):
    """update/create bible references"""
    # print('update/create bible references')

    i = 1
    for rex in RE_BIBLE_REF:
        query = KaraitesBookAsArray.objects.filter(book=book).filter(book_text__iregex=rex)
        # print('Query:{}'.format(query.count()))
        for book_text in query:
            for lang in [0, 2]:

                try:
                    for ref in re.findall(rex, book_text.book_text[lang]):
                        ref_text = BeautifulSoup(ref, 'html5lib').get_text().replace('\n', '').replace('\r', '')

                        english_ref, _ = parse_reference(ref_text)
                        if english_ref == '':
                            continue

                        References.objects.get_or_create(
                            karaites_book=book,
                            paragraph_number=book_text.paragraph_number,
                            paragraph_text=book_text.book_text,
                            foot_notes=[],
                            bible_ref_he=ref_text,
                            bible_ref_en=english_ref,
                        )
                        i += 1
                except Exception as e:
                    pass