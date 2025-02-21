from django.core.management.base import BaseCommand
from ...models import KaraitesBookAsArray


class Command(BaseCommand):
    help = 'Fill Database details from sheets'

    def handle(self, *args, **options):
        """ Extend field book_text in KaraitesBookAsArray """

        # get all instances of KaraitesBookAsArray
        instances = KaraitesBookAsArray.objects.all()
        for instance in instances:
            instance.book_text.append('0')
            instance.book_text.append('0')
            instance.book_text.append('0')
            instance.book_text.append('0')
            instance.book_text.append('0')
            instance.book_text.append('0')

            instance.save()
