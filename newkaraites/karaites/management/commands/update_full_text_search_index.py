from ...models import FullTextSearch


def update_full_text_search_index_english(book_name, paragraph, text):
    """
        Update the full text search index.
    """

    FullTextSearch.objects.get_or_create(
        reference_en=f"{book_name} {paragraph}",
        text_en=text,
        delete=True
    )


def update_full_text_search_index_hebrew(book_name, book_name_he, paragraph, text):
    """
        Update the full text search index.
    """

    FullTextSearch.objects.get_or_create(
        reference_en=f"{book_name} {paragraph}",
        reference_he=f"{book_name_he} {paragraph}",
        text_he=text,
        delete=True
    )


def update_full_text_search_index_en_he(book_name_en, book_name_he, paragraph, text_en, text_he):
    """
        Update the full text search index.
    """

    FullTextSearch.objects.get_or_create(
        reference_en=f"{book_name_en} {paragraph}",
        reference_he=f"{book_name_he} {paragraph}",
        text_en=text_en,
        text_he=text_he,
        delete=True
    )
