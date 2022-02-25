from ...models import KaraitesBookAsArray


def update_karaites_array(book_details, ref_chapter, paragraph_number, child):
    return KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child), 0],
        foot_notes=[]
    )


def update_karaites_array_language(book_details, ref_chapter, paragraph_number, child_en, child_he):
    data, _ = KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=['', 0, ''],
        foot_notes=[]

    )
    print(len(data.book_text))
    if child_en is not None:
        data.book_text[0] = str(child_en)

    if child_he is not None:
        data.book_text[1] = str(child_en)

    data.save()

    return data, _
