from ...models import KaraitesBookDetails


def process_arguments(options):
    books_to_process = []

    if options['list']:
        print()
        print('Id       Language        Level                     Classification   Book name')
        print('-----------------------------------------------------------------------------')
        for book in KaraitesBookDetails.objects.all():
            book_classification = book.book_classification.classification_name
            lang = book.get_language()
            book_name = book.book_title_en
            book_level = book.first_level.first_level
            print(f'{book.id:8} {lang:15} {book_level:25} {book_classification[0:14]:16} {book_name}')

        return []

    if options['comments'] or options['halakhah'] or options['liturgy'] \
            or options['poetry'] or options['polemic'] or options['exhortatory']:

        if options['comments']:
            books_to_process.append('Comments')

        if options['halakhah']:
            books_to_process.append('Halakhah')

        if options['liturgy']:
            books_to_process.append('Liturgy')

        if options['poetry']:
            books_to_process.append('Poetry (Non-Liturgical)')

        if options['polemic']:
            books_to_process.append('Polemic')

        if options['exhortatory']:
            books_to_process.append('Exhortatory')

        if options['all']:
            books_to_process = ['All']

    if options['book_id'] != 0:
        books_to_process = [options['book_id']]

    if len(books_to_process) == 1:
        if books_to_process[0] == 'All':
            return KaraitesBookDetails.objects.all()
        if books_to_process[0].isnumeric():
            return KaraitesBookDetails.objects.filter(pk=books_to_process[0])

        return KaraitesBookDetails.objects.filter(first_level__first_level__in=books_to_process)

    else:
        return KaraitesBookDetails.objects.filter(cron_schedule=True)