from ...models import (FullTextSearch,
                       FullTextSearchHebrew)


def update_full_text_search_index_english(book_name, paragraph, text, path):
    """
        Update the full text search index.
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
    FullTextSearchHebrew.objects.get_or_create(
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
        paragraph = f"{chapter}:{verse}"
    else:
        paragraph = chapter

    update_full_text_search_index_english(book_name_en, paragraph, text_en, path)
    update_full_text_search_index_hebrew(book_name_en, book_name_he, paragraph, text_he, path)
