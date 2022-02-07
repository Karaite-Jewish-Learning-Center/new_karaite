from ...models import (TableOfContents,
                       KaraitesBookAsArray)


def update_toc(book_details, paragraph_number, toc):

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
