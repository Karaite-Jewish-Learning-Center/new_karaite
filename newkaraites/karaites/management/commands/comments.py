import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...models import (Organization,
                       Author,
                       OtherBooks,
                       Comment,
                       CommentTmp)
from .html_utils.html_utils import (get_chapter_verse_en,
                                    get_chapter_verse_he,
                                    get_foot_note_index)


class Command(BaseCommand):
    help = 'Populate Database with comments at this point is only for the book bellow'

    @staticmethod
    def get_foot_notes(divs):

        end = len(divs)
        foot_notes = {}
        for note in divs[1:end]:
            foot_notes[get_foot_note_index(note)] = note.text
        return foot_notes

    @staticmethod
    def get_a_tag_in_child(child, foot_notes):
        foot_note_list = []
        for a_tag in child.find_all('a'):
            try:
                foot_note_number = int(a_tag.attrs['href'].replace('#_ftn', ''))
                foot_note_list.append(foot_notes[foot_note_number].strip())
            except KeyError:
                pass
        return foot_note_list

    def handle(self, *args, **options):
        """ Comments"""
        source = (f'../newkaraites/karaites/management/tmp/'
                  'English Deuteronomy_Keter Torah_Aaron ben Elijah.html')
        handle = open(source, 'r')
        html = handle.read()
        handle.close()
        html_tree = BeautifulSoup(html, 'html5lib')

        source_he = (f'../newkaraites/karaites/management/tmp/'
                     'Hebrew Deuteronomy_Keter Torah_Aaron ben Elijah.html')
        handle_he = open(source_he, 'r')
        html_he = handle_he.read()
        handle_he.close()

        html_tree_he = BeautifulSoup(html_he, 'html5lib')

        # first div is the book text, next div are the notes for comments on Deuteronomy
        # by Aaron ben Elijah on is book Keter Torah
        # millage may vary on other book authors

        divs_en = html_tree.find_all('div')
        divs_he = html_tree_he.find_all('div')

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

        # English
        for child in divs_en[0].find_all("p", class_="MsoNormal"):

            same_chapter, same_verses = get_chapter_verse_en(child, chapter_number)

            sys.stdout.write(
                f"\33[K Import English comments from {book_title}, chapter:{chapter_number} verse {verse_number}\r")

            if same_chapter is not None and same_verses is not None:

                chapter_number = same_chapter
                verse_number = same_verses[0]
                comment = Comment()
                comment.book = organization
                comment.chapter = chapter_number
                comment.verse = verse_number
                comment.comment_en = f"""{child}"""
                comment.comment_he = ""
                comment.comment_author = author
                comment.source_book = source_book
                comment.foot_notes_en = []
                comment.foot_notes_he = []
                comment.save()
            else:
                comment = Comment.objects.filter(book=organization, chapter=chapter_number,
                                                 verse=verse_number).last()
                comment.comment_en += f"""{child}"""
                # comment.foot_notes_en += foot_note_list_en
                comment.save()

        chapter_number = 1
        verse_number = 1
        # hebrew
        for child in divs_he[0].find_all("p", class_="MsoNormal"):
            # title
            if child.select_one('.MsoNormal b:first-child') is not None:
                continue
            if child.attrs.get('align', None) == 'center':
                continue

            sys.stdout.write(
                f"\33[K Import Hebrew comments from {book_title}, chapter:{chapter_number} verse:{verse_number}\r")

            same_chapter, same_verses = get_chapter_verse_he(child)

            # typo
            if same_chapter == 24 and same_verses == [24]:
                same_verses = [2, 4]

            if same_chapter is not None and same_verses is not None:

                chapter_number = same_chapter
                verse_number = same_verses[0]
                comment = CommentTmp()
                comment.book = organization
                comment.chapter = chapter_number
                comment.verse = verse_number
                comment.comment_he = f"""{child}"""
                comment.comment_author = author
                comment.source_book = source_book
                comment.foot_notes_he = []
                comment.save()
            else:
                comment = CommentTmp.objects.filter(book=organization, chapter=chapter_number,
                                                    verse=verse_number).last()
                # print(comment,organization, chapter_number,verse_number)
                # input('>>')

                comment.comment_he += f"""{child}"""
                comment.save()

        # # Add extra comments, those that are repeated in certain verses
        # # 1:2-3 => comment is repeated in verse 2 and 3
        # #
        sys.stdout.write(f"\33[K\r")

        en = divs_en[0].find_all("p", class_="MsoNormal")
        he = divs_he[0].find_all("p", class_="MsoNormal")
        i = 0
        for language in [en, he]:
            for child in language:
                if i == 0:
                    same_chapter, same_verses = get_chapter_verse_en(child, chapter_number)
                else:
                    same_chapter, same_verses = get_chapter_verse_he(child)
                # interested in 12:1-2 ...
                if same_verses is not None and len(same_verses) > 1:
                    for verse in same_verses[1:]:
                        if i == 0:
                            sys.stdout.write(
                                f"\33[K Adding English extra comments chapter:{same_chapter} verse:{verse}\r")
                            comment_query = Comment.objects.filter(comment_en__startswith=f"""{child}""")
                        else:
                            sys.stdout.write(
                                f"\33[K Adding Hebrew extra comments chapter:{same_chapter} verse:{verse}\r")
                            comment_query = CommentTmp.objects.filter(comment_he__startswith=f"""{child}""")

                        if comment_query.count() > 0:
                            comment = comment_query[0]
                            if i == 0:
                                add = Comment()
                            else:
                                add = CommentTmp()

                            add.book = comment.book
                            add.chapter = comment.chapter
                            add.verse = verse
                            add.comment_en = comment.comment_en
                            add.comment_he = comment.comment_he
                            add.comment_author = comment.comment_author
                            add.source_book = comment.source_book
                            add.foot_notes_en = comment.foot_notes_en
                            add.foot_notes_he = comment.foot_notes_he
                            add.save()
            i += 1
        sys.stdout.write(f"\33[K\r")

        # merge commentTmp into  comments
        for chapter in range(1, organization.chapters + 1):
            for verse in range(1, organization.verses[chapter - 1] + 1):

                sys.stdout.write(f"\33[K Merging English and Hebrew comments chapter:{chapter} verse:{verse}\r")

                comm = Comment.objects.filter(book=organization, chapter=chapter, verse=verse)
                temp = CommentTmp.objects.filter(book=organization, chapter=chapter, verse=verse)

                for comment, tmp_comment in zip(comm, temp):
                    comment.comment_he = tmp_comment.comment_he
                    comment.foot_notes_he = tmp_comment.foot_notes_he
                    comment.save()

        print()
