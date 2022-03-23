from .constants import (FIRST_LEVEL,
                        BOOK_CLASSIFICATION_DICT)


def process_arguments(options,
                      LIST_OF_BOOKS,
                      COMMENTS,
                      HALAKHAH,
                      HAVDALA,
                      PASSOVER_SONGS,
                      PURIM_SONGS,
                      PRAYERS,
                      POLEMIC,
                      SHABBAT_SONGS,
                      WEDDING_SONGS,
                      SUPPLEMENTAL,
                      POETRY_NON_LITURGICAL):

    books_to_process = []

    if options['list']:
        print()
        print('Id La   Level                          Classification   Book name')
        print('-----------------------------------------------------------------')
        i = 1
        for _, book, language, _, _, details, _ in LIST_OF_BOOKS:
            level = details.get('first_level', 'None')
            classification = details.get('book_classification', None)
            lang = language.capitalize().replace('en', 'En')
            book_name = book.replace('.html', '').replace('-{}', '')

            if level is not None and classification is not None:
                book_level = FIRST_LEVEL[int(level) - 1][1]
                book_classification = BOOK_CLASSIFICATION_DICT[classification]
                print(f'{i:02} {lang:12} {book_level:25} {book_classification[0:12]:14} {book_name}')
            else:
                print(f'{i:02} {lang:12} {"Tanakh":25} {"-- ":14} {book_name}')

            i += 1
        return []

    if options['comments'] or options['halakhah'] or options['liturgy'] or options['poetry'] or options['polemic']:

        if options['comments']:
            books_to_process += COMMENTS

        if options['halakhah']:
            books_to_process += HALAKHAH

        if options['liturgy']:
            books_to_process += HAVDALA + PASSOVER_SONGS + PURIM_SONGS + PRAYERS + SHABBAT_SONGS + WEDDING_SONGS + SUPPLEMENTAL

        if options['poetry']:
            books_to_process += POETRY_NON_LITURGICAL

        if options['polemic']:
            books_to_process += POLEMIC
    else:
        books_to_process = LIST_OF_BOOKS

    if options['book_id'] != 0:
        books_to_process = [LIST_OF_BOOKS[int(options['book_id']) - 1]]

    return books_to_process
