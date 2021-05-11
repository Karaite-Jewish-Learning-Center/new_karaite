from django.contrib.postgres.fields import ArrayField
from django.utils.safestring import mark_safe
from django.db.models import JSONField
from django.db import models
from django.utils.translation import gettext as _
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL)
from tinymce.models import HTMLField


class Organization(models.Model):
    """
        Books order
    """

    first_level = models.IntegerField(default=0,
                                      choices=FIRST_LEVEL,
                                      verbose_name=_('Law'))

    second_level = models.IntegerField(default=0,
                                       choices=SECOND_LEVEL,
                                       verbose_name=_("Second level"))

    book_title_en = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title English"))

    book_title_he = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title Hebrew"))

    chapters = models.IntegerField(default=1,
                                   verbose_name=_("How many chapters in this book"))

    verses = ArrayField(models.IntegerField(),
                        null=True,
                        blank=True,
                        editable=False,
                        verbose_name=_("How many verses in each chapter"))

    order = models.IntegerField(default=0,
                                db_index=True,
                                verbose_name=_('Presentation order'))

    def __str__(self):
        return f"{self.book_title_en}"

    def to_json(self):
        return {'id': self.id,
                'book_title_en': self.book_title_en,
                'book_title_he': self.book_title_he,
                'chapters': self.chapters,
                'verses': self.verses,
                }

    @staticmethod
    def get_list_of_books():
        """ Return a dict with a list of book each second_level"""
        books = Organization.objects.values().order_by('first_level',
                                                       'second_level',
                                                       'order')
        data = []
        temp = []
        i = 0
        count = books.count()
        while i < count:
            level = books[i]
            book = level
            page = 0
            while book['second_level'] == level['second_level']:
                temp.append(books[i])
                i += 1
                page += 1
                #  we want to display 3 books in a line
                if i >= count or page % 3 == 0:
                    break
                book = books[i]
            data.append(temp)
            temp = []
        return data

    class Meta:
        verbose_name_plural = _("   Architecture")
        ordering = ['order']


class CommentAuthor(models.Model):
    """
        Who made the comment
    """

    name = models.CharField(max_length=50)

    comments_count = models.IntegerField(default=0,
                                         editable=False,
                                         verbose_name=_('Comment count'))

    history = models.TextField(null=True,
                               blank=True,
                               verbose_name=_("History"))

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name_plural = "Commentary Author"


class Comment(models.Model):
    """
       Comments on chapter / verse
    """
    book = models.ForeignKey(Organization,
                             null=True,
                             blank=True,
                             on_delete=models.CASCADE,
                             verbose_name=_('Book'))

    chapter = models.IntegerField(default=1,
                                  verbose_name=_("Chapter"))

    verse = models.IntegerField(default=1,
                                verbose_name=_("Verse"))

    comment_en = HTMLField(null=True,
                           blank=True,
                           verbose_name=_("Comment English"))

    comment_he = HTMLField(null=True,
                           blank=True,
                           verbose_name=_("Comment Hebrew"))

    comment_author = models.ForeignKey(CommentAuthor,
                                       on_delete=models.DO_NOTHING,
                                       verbose_name=_('Author'))

    def __str__(self):
        return f"{self.comment_author} - {self.book}"

    def to_json_book_details(self):
        """ We dont need to send book details with every comment"""
        # todo
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'author': self.comment_author.name,
                'comment_count': self.comment_author.comments_count,
                }

    def to_json(self):
        """ Serialize instance to json"""
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'chapter': self.chapter,
                'verse': self.verse,
                'comment_en': self.comment_en,
                'comment_he': self.comment_he,
                'author': self.comment_author.name,
                'comment_count': self.comment_author.comments_count,
                }

    @staticmethod
    def to_json_comments(book=None, chapter=None, verse=None):
        """ Serialize several instance to json """
        result = []
        if chapter is None and verse is None:
            query = Comment.objects.filter(book=book)
        elif verse is None:
            query = Comment.objects.filter(book=book, chapter=chapter)
        else:
            query = Comment.objects.filter(book=book, chapter=chapter, verse=verse)

        for comment in query:
            result.append(comment.to_json())
        return result

    @mark_safe
    def english(self):
        return self.comment_en

    english.short_description = "English Comment"

    @mark_safe
    def hebrew(self):
        return self.comment_he

    hebrew.short_description = "Hebrew Comment"

    def save(self, *args, **kwargs):
        """ Update books comment count if new comment"""
        if self.pk is None:
            book = BookText.objects.get(book=self.book,
                                        chapter=self.chapter,
                                        verse=self.verse)
            book.comments_count += 1
            book.save()

            self.comment_author.comments_count += 1
            self.comment_author.save()

        super(Comment, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        """ Update books comment count """
        book = BookText.objects.get(book=self.book,
                                    chapter=self.chapter,
                                    verse=self.verse)
        book.comments_count -= 1
        book.save()

        self.comment_author.comments_count -= 1
        self.comment_author.save()

        super(Comment, self).delete(using=using, keep_parents=keep_parents)

    class Meta:
        verbose_name_plural = "Commentaries"
        ordering = ('book', 'chapter', 'verse')


class BookText(models.Model):
    """
       A bible text book
    """

    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name=_('Book'))

    chapter = models.IntegerField(default=0,
                                  verbose_name=_("Chapter"))

    verse = models.IntegerField(default=0,
                                verbose_name=_("Verse"))

    text_en = models.TextField(null=True,
                               verbose_name=_("English chapter Verse text"))

    text_he = models.TextField(null=True,
                               verbose_name=_("Hebrew chapter Verse text"))

    comments_count = models.IntegerField(default=0,
                                         editable=False,
                                         verbose_name=_("Total Comments"))

    def __str__(self):
        return f'{self.book.book_title_en}           {self.book.book_title_he:>40}'

    def to_json(self):
        """Serialize instance to json"""
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'chapter': self.chapter,
                'verse': self.verse,
                'text_en': self.text_en,
                'text_he': self.text_he,
                'comments_count': self.comments_count
                }

    @staticmethod
    def to_json_books(book, chapter, verse=None):
        """ Serialize several instances"""

        if chapter is None and verse is None:
            book_text = BookText.objects.filter(book=book)
        elif verse is None:
            book_text = BookText.objects.filter(book=book, chapter=chapter)
        else:
            book_text = BookText.objects.filter(book=book, chapter=chapter, verse=verse)

        result = []
        for book in book_text:
            result.append(book.to_json())
        return result

    def save(self, *args, **kwargs):
        """ Update bookText and BookAsArray version
            0 -> text English
            1 -> text Hebrew
            2 -> comment_count
        """
        verse = self.verse - 1
        book_as_array = BookAsArray.objects.get(book=self.book, chapter=self.chapter)
        book_as_array.book_text[verse][0] = self.text_en
        book_as_array.book_text[verse][1] = self.text_he
        book_as_array.book_text[verse][2] = self.comments_count
        book_as_array.save()

        # save data to BookText
        super(BookText, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = _("  Biblical Text")
        ordering = ('book', 'chapter', 'verse')


class BookAsArray(models.Model):
    """ Map book to postgresql array field """

    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name="Book"
                             )

    chapter = models.IntegerField(default=0)

    # text english, text hebrew, comment_count. Verse is position in the array
    book_text = ArrayField(ArrayField(models.TextField(), size=3))

    def to_json(self):

        return {'chapter': self.chapter,
                'text': self.book_text
                }

    @staticmethod
    def to_json_book_array(book, chapter=None):
        result = []
        if chapter is None:
            query = BookAsArray.objects.filter(book=book)
        else:
            query = BookAsArray.objects.filter(book=book, chapter=chapter)

        for book in query:
            result.append(book.to_json())

        return result

    def __str__(self):
        return self.book.book_title_en

    class Meta:
        ordering = ('book', 'chapter')


class Ref(models.Model):
    """  References """
