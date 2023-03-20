from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray)


def update_karaites_array_array(book, ref_chapter, paragraph_number, child, footnotes=[]):

    return KaraitesBookAsArray.objects.get_or_create(
        book=book,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child), 0, ''],
        foot_notes=footnotes
    )


def update_karaites_array(book, ref_chapter, paragraph_number, child_he, child_en, footnotes=[]):

    obj, created = KaraitesBookAsArray.objects.get_or_create(
        book=book,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child_he), 0, child_en],
        foot_notes=footnotes
    )

    if not created:
        he = obj.book_text[0] if obj.book_text[0] != '' else str(child_he)
        en = obj.book_text[2] if obj.book_text[2] != '' else str(child_en)
        obj.book_text = [he, 0, en]
        obj.save()

    return obj, created


def update_karaites_array_details(book, ref_chapter, paragraph_number, child, footnotes=[]):

    details = KaraitesBookDetails.objects.get(book_title_en=book)
    obj, created = KaraitesBookAsArray.objects.get_or_create(
        book=details,
        # ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=child,
        foot_notes=footnotes
    )

    if not created:
        en = obj.book_text[0] if obj.book_text[0] != '' else child[0]
        he = obj.book_text[2] if obj.book_text[2] != '' else child[2]
        obj.book_text = [en, 0, he]
        obj.save()

    return obj, created
