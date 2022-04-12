from ...models import FullTextSearch
from hebrew_numbers import int_to_gematria


def update_full_text_search_index_english(book_name, paragraph, text, path):
    """
        Update the full text search index.ok
    """
    marker = "#" if path != 'Tanakh' else " "
    FullTextSearch.objects.get_or_create(
        path=path,
        reference_en=f"{book_name}{marker}{paragraph}",
        text_en=text,
        delete=True
    )


def update_full_text_search_index_hebrew(book_name, book_name_he, paragraph, text, path):
    """
        Update the full text search index.
    """
    marker = "#" if path != 'Tanakh' else " "
    FullTextSearch.objects.get_or_create(
        path=path,
        reference_en=f"{book_name}{marker}{paragraph}",
        reference_he=f"{book_name_he}{marker}{paragraph}",
        text_he=text,
        delete=True
    )


def update_full_text_search_index_en_he(book_name_en, book_name_he, chapter, verse, text_en, text_he, path):
    """
        Update the full text search index.
    """

    if path == 'Tanakh':
        en_text = f"{book_name_en} {chapter}:{verse}"
        he_text = f"{book_name_he} {chapter}:{verse}"
    else:
        en_text = f"{book_name_en}#{chapter}"
        he_text = f"{book_name_he}#{chapter}"

    FullTextSearch.objects.get_or_create(
        path=path,
        reference_en=en_text,
        reference_he=he_text,
        text_en=text_en,
        text_he=text_he,
        delete=True
    )
