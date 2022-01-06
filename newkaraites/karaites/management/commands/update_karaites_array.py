from ...models import KaraitesBookAsArray


def update_karaites_array(book_details, ref_chapter, paragraph_number, child):
    return KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child), 0],
        foot_notes=[]
    )
