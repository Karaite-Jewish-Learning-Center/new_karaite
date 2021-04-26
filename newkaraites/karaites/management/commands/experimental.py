import json
from django.core.management.base import BaseCommand
from ...models import (BookText,
                       CommentAuthor,
                       Comment)
import zipfile
from lxml import etree


class Command(BaseCommand):
    help = 'Populate Database with comments'

    def handle(self, *args, **options):
        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

    # @staticmethod
    # def get_xml(source):
    #     handle = zipfile.ZipFile(source, 'r')
    #     xml_data = handle.read('word/document.xml')
    #     handle.close()
    #     return xml_data
    #
    # def handle(self, *args, **options):
    #     """ Comments"""
    #
    #     source = '../newkaraites/data_experimental/Short Book Test 2.docx'
    #     handle = zipfile.ZipFile(source, 'r')
    #     xml_data = handle.read('word/document.xml')
    #     handle.close()
    #
    #     # xml_data = self.get_xml(source)
    #     xml_tree = etree.fromstring(xml_data)
    #     root = xml_tree.getroottree()
    #
    #     paragraphs = []
    #
    #     for child in root.iter():
    #         if child.tag.endswith("t"):
    #             pass
    #         if child.tag.endswith("footnoteReference"):
    #             pass
    #         if child.tag.endswith("rStyle"):
    #             style = child.values()[0]
    #             if style == 'it-text':
    #                 pass
    #
    #         if child.tag.endswith("rtl"):
    #             # Hebrew text from left to right
    #             pass
    #
    #     # for child in root.iter():
    #     #     ...:
    #     #     ...: print("----------------------------------------------")
    #     #     ...: print(child.tag)
    #     #     ...: print(child.attrib)
    #     #     ...: print(child.values())
    #     #     ...: print(child.text)
    #     #     ...:
    #     #     for c in child.iter():
    #     #         ...: print("->", c.tag, c.attrib, c.values())
    #     #     ...:
    #     #     if child.tag.endswith("footnote"):
    #     #         ...: embed()