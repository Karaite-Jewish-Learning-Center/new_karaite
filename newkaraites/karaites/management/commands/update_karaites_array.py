from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray)


def update_karaites_array(book_details, ref_chapter, paragraph_number, child):
    return KaraitesBookAsArray.objects.get_or_create(
        book=book_details,
        ref_chapter=ref_chapter,
        paragraph_number=paragraph_number,
        book_text=[str(child), 0],
        foot_notes=[]
    )


def update_karaites_array_language(book_details, ref_chapter, paragraph_number, child_en='', child_he=''):
    new = False
    try:
        details = KaraitesBookDetails.objects.get(book_title_en=book_details)
        data = KaraitesBookAsArray.objects.get(book=details, ref_chapter=ref_chapter,
                                               paragraph_number=paragraph_number)
    except KaraitesBookAsArray.DoesNotExist:
        new = True
        data = KaraitesBookAsArray()
        data.book = details

    data.ref_chapter = ref_chapter
    data.paragraph_number = paragraph_number

    if new:
        data.book_text = [str(child_en), 0, str(child_he)]
    else:
        if child_en == '':
            data.book_text = [data.book_text[0], 0, child_he]
        if child_he == '':
            data.book_text = [child_en, 0, data.book_text[2]]

    data.foot_notes = []
    data.foot_notes = []

    if data.book_text != ['\n', 0, '\n'] and data.book_text != ['\n', 0, ''] and data.book_text != ['', 0, '\n']:
        data.save()
        return None, False

    return data, new
