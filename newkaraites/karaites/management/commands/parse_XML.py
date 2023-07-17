# XML tags:
# document = the entire document
# p = a paragraph
# margin = a marginal note
# i = italics
# b = bold
# sc = small caps
# h1 = a chapter title
# sup = superscript
# u = underlined
# quotation = a quotation
# footnote = a footnote
# url = A URL
# green = the part that needs to be typeset in Koren Tanakh
# quran = the part that needs to be typeset in Quranic font

from django.core.management.base import BaseCommand
from xml.etree import ElementTree as ET


class Command(BaseCommand):
    help = 'Populate audio bible books with empty start and stop times'

    def handle(self, *args, **options):
        """ parse XML file """

        open('data_karaites/HTML/Liturgy/Shabbat Morning Services/Qedushot and Piyyut Parasha/Qedushot and Piyyut Parasha.xml', 'r')
