from ...models import (Author,
                       KaraitesBookDetails)


def update_book_details(data, introduction=''):
    """ update book details """

    author, _ = Author.objects.get_or_create(name=data['name'])
    author.save()

    obj, create = KaraitesBookDetails.objects.get_or_create(book_title=data['name'], author=author,
                                                            defaults={'first_level': data['first_level'],
                                                                      'book_language': 'he',
                                                                      'book_classification': data['book_classification'],
                                                                      'author': author,
                                                                      'book_title': data['name'],
                                                                      'introduction': str(introduction)
                                                                      }
                                                            )

    if not create:
        obj.introduction = str(introduction)
        obj.save()

    return obj, create
