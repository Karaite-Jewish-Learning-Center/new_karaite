from ...models import BooksFootNotes


def update_footnotes(details, footnote_ref, footnote_text, footnote_number, lang):
    """ Update the footnote for the given book. """

    print('update_footnotes: ', details, footnote_ref, footnote_text, footnote_number, lang)

    BooksFootNotes.objects.get_or_create(
        book=details,
        footnote_ref=footnote_ref,
        footnote_number=footnote_number,
        footnote=footnote_text.strip().replace('\n', ' ').replace('\r', ' '),
        language=lang,
    )

