from ...models import (Author,
                       KaraitesBookDetails)


def update_book_details(data, introduction='', language='he'):
    """ update book details """
    book_title_en, book_title_he = data['name'].split(',')
    author, _ = Author.objects.get_or_create(name=data['name'])
    author.save()

    obj, create = KaraitesBookDetails.objects.get_or_create(book_title_en=book_title_en, author=author,
                                                            defaults={'first_level': data['first_level'],
                                                                      'book_language': language,
                                                                      'book_classification': data['book_classification'],
                                                                      'author': author,
                                                                      'book_title_en': book_title_en,
                                                                      'book_title_he': book_title_he,
                                                                      'introduction': str(introduction)
                                                                      }
                                                            )

    if not create:
        obj.introduction = str(introduction)
        obj.save()

    return obj, create
