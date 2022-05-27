from ...models import BooksFootNotes
from .command_utils.utils import roman_to_int


def update_footnotes(details, footnote_ref, footnote_text, lang):
    """ Update the footnote for the given book. """

    # some references are Roman numerals, some are Arabic numerals,
    # so we need to convert them to Arabic numerals
    footnote_ref_strip_square_brackets = footnote_ref.replace('[', '').replace(']', '')

    if footnote_ref_strip_square_brackets.isnumeric():
        footnote_number = int(footnote_ref_strip_square_brackets)
    elif footnote_ref_strip_square_brackets.isalpha():
        footnote_number = roman_to_int(footnote_ref_strip_square_brackets)
    else:
        print(f'Footnote {footnote_ref} reference is not a number or a Roman numeral')

    # if the footnote is already in the database, update it
    BooksFootNotes.objects.get_or_create(
        book=details,
        footnote_ref=footnote_ref,
        footnote_number=footnote_number,
        footnote=footnote_text.strip().replace('\n', ' ').replace('\r', ' '),
        language=lang,
    )
