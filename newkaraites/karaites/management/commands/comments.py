import json
from django.core.management.base import BaseCommand
from ...models import (BookText,
                       CommentAuthor,
                       Comment)
from bs4 import BeautifulSoup
from lxml import etree


class Command(BaseCommand):
    help = 'Populate Database with comments'

    def handle(self, *args, **options):
        """ Comments"""

        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

        html_tree = BeautifulSoup(html, 'html5lib')
        # dom = etree.HTML(html)
        #
        # node_list = dom.xpath('//div[@id="ftn4"]')
        # foot_data = {}
        # for node in node_list:
        #     foot_data[node.attrib['id']] = " ".join([text for text in node.itertext()]).strip()
        #
        # print(foot_data)
        # print(dom.xpath('//div[starts-with(@id,"ftn")]'))
