import sys
from django.core.management.base import BaseCommand
from ...models import (KaraitesBookDetails,
                       KaraitesBookAsArray)


class Command(BaseCommand):
    help = 'Dump book as html'

    def add_arguments(self, parser):
        parser.add_argument(
            '--book_id',
            dest='book_id',
            default=False,
            help='Dump book to html file',
        )
        parser.add_argument(
            '--list_books',
            action='store_true',
            default=False,
            help='List book as array in database',
        )
        parser.add_argument(
            '--out',
            dest='out',
            default=False,
            help='output to file default is book.html',
        )

    def handle(self, *args, **options):
        if options['list_books']:
            print()
            print('Id      lang     Book name')
            print('---------------------------')
            print()
            for book in KaraitesBookDetails.objects.all():
                print(f'{book.id}      {book.book_language}       {book.book_title}')

            print()
            sys.exit(0)

        if options['out']:
            out_file = options['out']
        else:
            out_file = 'book.html'

        if not options['book_id']:
            print('Need a book id')
            sys.exit(1)

        try:
            book = KaraitesBookDetails.objects.get(pk=options['book_id'])
        except KaraitesBookDetails.ObjectDoesNotExist:
            print('Invalid id, try: --book_list')
            sys.exit(2)

        handle = open('../newkaraites/karaites/management/book_dumps/' + out_file, "w")
        i = 1
        for paragraph in KaraitesBookAsArray.objects.filter(book=options['book_id']):
            sys.stdout.write(
                f"\33[K Rewriting {book.book_title} as html: {i}\r")
            handle.write(paragraph.book_text[0])
            i += 1

        handle.close()
        sys.stdout.write("\33[K\r")
