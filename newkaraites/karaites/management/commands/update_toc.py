from ...models import (TableOfContents,
                       KaraitesBookAsArray)


def update_toc(book_details, paragraph_number, toc):
    print(toc)
    print(book_details)
    print(paragraph_number)
    TableOfContents.objects.get_or_create(
        karaite_book=book_details,
        subject=toc,
        start_paragraph=paragraph_number
    )
    # ref_chapter = toc[0]

    # update previous record that's the header for chapter
    header = KaraitesBookAsArray.objects.get(book=book_details,
                                             paragraph_number=paragraph_number)
    # header.ref_chapter = ref_chapter
    header.book_text[1] = 1
    header.save()
