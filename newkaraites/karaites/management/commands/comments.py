import re
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       CommentAuthor,
                       Comment)
from ...html_utils import get_chapter_verse
from bs4 import BeautifulSoup


class Command(BaseCommand):
    help = 'Populate Database with comments'

    def handle(self, *args, **options):
        """ Comments"""
        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

        html_tree = BeautifulSoup(html, 'html5lib')

        # foot_notes_node = html_tree.find_all('p', class_='MsoFootnoteText')
        #
        # foot_notes ={}
        # for notes in foot_notes_node:
        #

        organization = Organization.objects.get(book_title_en="Deuteronomy")
        author = CommentAuthor.objects.get(name='me')
        for child in html_tree.find_all("p", class_="MsoNormal"):
            if child.name is not None:
                if child.name == 'p' and child.get_attribute_list('class') == ['MsoNormal']:

                    same_chapter, same_verses = get_chapter_verse(child)
                    if same_chapter is not None and same_chapter != '':
                        chapter, verses = same_chapter, same_verses

                    chapter_number = int(chapter)
                    for verse in verses:
                        verse_number = int(verse)
                        try:
                            comment = Comment.objects.get(book=organization, chapter=chapter_number, verse=verse_number)
                            comment.comment_en += str(child)
                        except Comment.DoesNotExist:
                            comment = Comment()
                            comment.book = organization
                            comment.chapter = chapter_number
                            comment.verse = verse_number
                            comment.comment_en = str(child)
                            comment.comment_he = ''
                            comment.comment_author = author
                        print(comment.book)
                        comment.save()
