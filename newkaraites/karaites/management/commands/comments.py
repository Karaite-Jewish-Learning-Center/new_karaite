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
        book_title = "Deuteronomy"
        organization = Organization.objects.get(book_title_en=book_title)
        author, _ = Author.objects.get_or_create(name='Aaron ben Elija')
        source_book, _ = OtherBooks.objects.get_or_create(
            book_title_en='Keter Torah',
            author=author,
            classification=1
        )
        chapter_number = 1
        verse_number = 1

        for child in divs[0].find_all("p", class_="MsoNormal"):
            # find foot notes
            foot_note_list = []
            for a_tag in child.find_all('a'):
                try:
                    foot_note_number = int(a_tag.attrs['href'].replace('#_ftn', ''))
                    foot_note_list.append(foot_notes[foot_note_number].strip())
                except KeyError:
                    pass

            same_chapter, same_verses = get_chapter_verse(child)

            print(f"Import comments from {book_title}, chapter:{chapter_number} verse {verse_number}")

            if same_chapter is not None and same_verses is not None:

                chapter_number = same_chapter
                verse_number = same_verses[0]
                comment = Comment()
                comment.book = organization
                comment.chapter = chapter_number
                comment.verse = verse_number
                comment.comment_en = str(child)
                comment.comment_he = ''
                comment.comment_author = author
                comment.source_book = source_book
                comment.foot_notes = foot_note_list
                comment.save()
            else:
                comment = Comment.objects.filter(book=organization, chapter=chapter_number, verse=verse_number).last()
                comment.comment_en += str(child)
                comment.foot_notes += foot_note_list
                comment.save()

        for child in divs[0].find_all("p", class_="MsoNormal"):
            same_chapter, same_verses = get_chapter_verse(child)
            # interested in 12:1-2 ...
            if same_verses is not None and len(same_verses) > 1:

                for verse in same_verses[1:]:
                    comment = Comment.objects.filter(comment_en__startswith=(str(child)))[0]
                    add = Comment()
                    add.book = comment.book
                    add.chapter = comment.chapter
                    add.verse = verse
                    add.comment_en = comment.comment_en
                    add.comment_he = comment.comment_he
                    add.comment_author = comment.comment_author
                    add.source_book = comment.source_book
                    add.foot_notes = comment.foot_notes
                    add.save()
