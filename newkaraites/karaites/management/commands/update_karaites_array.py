from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray)


def update_karaites_array_array(book_details, ref_chapter, paragraph_number, child):
    return KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child), 0, ''],
        foot_notes=[]
    )


def update_karaites_array(book_details, ref_chapter, paragraph_number, child_he, child_en):
    return KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child_he), 0, child_en],
        foot_notes=[]
    )


def update_karaites_array_details(book_details, ref_chapter, paragraph_number, child):
    details = KaraitesBookDetails.objects.get(book_title_en=book_details)

    return KaraitesBookAsArray.objects.get_or_create(
        book=details,
        # ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=child,
        foot_notes=[]
    )
