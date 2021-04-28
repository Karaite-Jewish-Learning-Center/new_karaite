import re
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       CommentAuthor,
                       Comment)
from bs4 import BeautifulSoup


class Command(BaseCommand):
    help = 'Populate Database with comments'

    @staticmethod
    def get_chapter_verse(html):
        """ Parse chapter number"""
        chapter = None
        verse = None
        # most of times span follows <p class="MsoNormal"..
        span = html.find('span')
        if span is None:
            # some times <b> encapsulates <span> that has some text
            span = html.find('b').find('span')

        if span is not None:
            try:
                # 11:9-11:10
                pattern = re.search('[0-9]*:[0-9]*–[0-9]*:[0-9]*', span.text)
                if pattern is not None and pattern.start() == 0:
                    parts = pattern.group().split(':')
                    chapter = parts[0]
                    verse = parts[1][:parts[1].find("–")+1]+parts[2]
                    print(chapter, verse)
                    return chapter, verse

                # 11:9 , 11:9-10
                pattern = re.search('[0-9,:,–]+', span.text)
                if pattern is not None and pattern.start() == 0:
                    return pattern.group().split(" ")[0].split(":")

            except (ValueError, IndexError):
                pass
        return chapter, verse

    def handle(self, *args, **options):
        """ Comments"""
        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

        html_tree = BeautifulSoup(html, 'html5lib')
        organization = Organization.objects.get(book_title_en="Deuteronomy")
        author = CommentAuthor.objects.get(name='me')

        for child in html_tree.find_all("p", class_="MsoNormal"):
            if child.name is not None:
                if child.name == 'p' and child.get_attribute_list('class') == ['MsoNormal']:

                    same_chapter, same_verses = self.get_chapter_verse(child)
                    if same_chapter is not None and same_chapter != '':
                        chapter, verses = same_chapter, same_verses

                    chapter_number = int(chapter)
                    for verse in verses.split("–"):
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
