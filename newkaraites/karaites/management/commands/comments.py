from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       Author,
                       OtherBooks,
                       Comment)
from ...html_utils import (get_chapter_verse,
                           get_foot_note_index)


class Command(BaseCommand):
    help = 'Populate Database with comments at this point is only for the book bellow'

    def handle(self, *args, **options):
        """ Comments"""
        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

        html_tree = BeautifulSoup(html, 'html5lib')

        # first div is the book text, next 498 are the notes
        divs = html_tree.find_all('div')
        end = len(divs)
        foot_notes = {}
        for note in divs[1:end]:
            foot_notes[get_foot_note_index(note)] = note.text

        # check that we don't miss any foot note
        processed = True
        for i in range(1, end - 1):
            if foot_notes.get(i, None) is None:
                print(f'Missing note: {i}')
                processed = False

        # stop processing and let the operator do some thing about missing notes
        if not processed:
            exit(1)

        organization = Organization.objects.get(book_title_en="Deuteronomy")
        author, _ = Author.objects.get_or_create(name='Aaron ben Elija')
        source_book, _ = OtherBooks.objects.get_or_create(
            book_title_en='Keter Torah',
            author=author,
            classification=1
        )
        for child in divs[0].find_all("p", class_="MsoNormal"):
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
                            comment.source_book = source_book
                        comment.save()
