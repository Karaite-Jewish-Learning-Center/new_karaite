from ...models import (TableOfContents,
                       KaraitesBookAsArray)


def update_toc(book, paragraph_number, toc):
    print(book, paragraph_number, toc)
    TableOfContents.objects.get_or_create(
        karaite_book=book,
        subject=toc,
        start_paragraph=paragraph_number
    )

    # update previous record that's the header for chapter
    # header = KaraitesBookAsArray.objects.get(book=book,
    #                                          paragraph_number=paragraph_number)
    # header.book_text[1] = 1
    # header.save()
