import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       Author,
                       OtherBooks,
                       Comment)
from ...html_utils import (get_chapter_verse,
                           get_foot_note_index)
from ...comments_map import map_docx_to_karaites_html


class Command(BaseCommand):
    help = 'Populate Database with comments at this point is only for the book bellow'

    def handle(self, *args, **options):
        """ Comments"""
        source = '../newkaraites/data_experimental/English Deuteronomy_Keter Torah_Aaron ben Elijah.html'
        handle = open(source, 'r')
        html = handle.read()
        handle.close()

        html_tree = BeautifulSoup(html, 'html5lib')

        # first div is the book text, next 498 are the notes for comments on Deuteronomy
        # by Aaron ben Elijah on is book Keter Torah
        # millage may vary on other book authors

        divs = html_tree.find_all('div')
        end = len(divs)
        foot_notes = {}
        for note in divs[1:end]:
            foot_notes[get_foot_note_index(note)] = note.text

        # check that we don't miss any foot note
        processed = True
        for i in range(1, end - 1):
            sys.stdout.write(f"\33[KProcessing foot note {i}\r")

            if foot_notes.get(i, None) is None:
                print(f'Missing note: {i}\r')
                processed = False

        # stop processing and let the operator/programmer/dev ops do some thing about missing notes
        if not processed:
            exit(1)

        # clear terminal output line
        sys.stdout.write(f"\33[K\r")

        book_title = "Deuteronomy"
        organization = Organization.objects.get(book_title_en=book_title)
        author, _ = Author.objects.get_or_create(name='Aaron ben Elijah')

        author.comments_count = 0
        author.save()

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

            sys.stdout.write(f"\33[KImport comments from {book_title}, chapter:{chapter_number} verse {verse_number}\r")

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
                comment.foot_notes_en = foot_note_list
                comment.foot_notes_he = ''
                comment.save()
            else:
                comment = Comment.objects.filter(book=organization, chapter=chapter_number, verse=verse_number).last()
                comment.comment_en += str(child)
                comment.foot_notes_en += foot_note_list
                comment.foot_notes_he = ''
                comment.save()

        # Add extra comments, those that are repeated in certain verses
        # 1:2-3 => comment is repeated in verse 2 and 3

        sys.stdout.write(f"\33[K\r")

        for child in divs[0].find_all("p", class_="MsoNormal"):
            same_chapter, same_verses = get_chapter_verse(child)
            # interested in 12:1-2 ...
            if same_verses is not None and len(same_verses) > 1:
                for verse in same_verses[1:]:
                    sys.stdout.write(f"\33[KAdding extra comments chapter:{same_chapter} verse {verse}\r")
                    comment_query = Comment.objects.filter(comment_en__startswith=(str(child)))
                    if comment_query.count() > 0:
                        comment = comment_query[0]
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

        sys.stdout.write(f"\33[K\r")
        print()
        sys.stdout.write('Please run command comments_map_html')
        print()
