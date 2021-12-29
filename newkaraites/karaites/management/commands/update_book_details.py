from ...models import (Author,
                       KaraitesBookDetails)


def update_book_details(data):
    """ update book details """
    author, _ = Author.objects.get_or_create(name=data['name'])
    author.save()

    return KaraitesBookDetails.objects.get_or_create(
            first_level=data['first_level'],  # Halakhah
            book_language='he',
            book_classification=data['book_classification'],
            author=author,
            book_title=data['name']
        )
