import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Author,
                       KaraitesBookDetails,
                       KaraitesBookAsArray)

from ...utils import clear_terminal_line
from .udpate_bible_ref import update_create_bible_refs
from .update_toc import update_toc
from .html_utils.utils import get_html


class Command(BaseCommand):
    help = 'Populate Database with Sefer Milhamot'

    def handle(self, *args, **options):
        """ Karaites books as array """
