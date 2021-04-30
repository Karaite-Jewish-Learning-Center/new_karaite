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
        verbose_name_plural = _("   Organizations")
        ordering = ['order']


class CommentAuthor(models.Model):
    """
        Who made the comment
    """

    name = models.CharField(max_length=50)

    history = models.TextField(null=True,
                               blank=True,
                               verbose_name=_("History"))

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name_plural = "Comment Author"


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

    comments_count = models.IntegerField(default=0,
                                         editable=False,
                                         verbose_name=_('Comment count'))

    def __str__(self):
        return f"{self.comment_author} - {self.book}"

    @mark_safe
    def english(self):
        return self.comment_en

    english.short_description = "English Comment"

    @mark_safe
    def hebrew(self):
        return self.comment_he

    english.short_description = "Hebrew Comment"

    def save(self, *args, **kwargs):
        """ Update books comment count if new comment"""
        if self.pk is None:
            book = BookText.objects.get(book=self.book,
                                        chapter=self.chapter,
                                        verse=self.verse)
            book.comments_count += 1
            book.save()

        super(Comment, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        """ Update books comment count """
        book = BookText.objects.get(book=self.book,
                                    chapter=self.chapter,
                                    verse=self.verse)
        book.comments_count -= 1
        book.save()

        super(Comment, self).delete(using=using, keep_parents=keep_parents)

    class Meta:
        verbose_name_plural = "Comments"
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

    def save(self, *args, **kwargs):
        """ Update json book version """
        json_book = BookJson.objects.get(book=self.book)
        json_book.book_json_en['text'][f'{self.chapter-1}'][f'{self.verse-1}'] = self.text_en
        json_book.book_json_he['text'][f'{self.chapter-1}'][f'{self.verse-1}'] = self.text_he
        json_book.save()

        # save data to BookText
        super(BookText, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = _("  Book text")
        ordering = ('book', 'chapter', 'verse')


class BookJson(models.Model):
    """ Store all book as json"""
    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name="Book"
                             )

    book_json_en = JSONField(null=True,
                             blank=True,
                             verbose_name="Book as Json English")

    book_json_he = JSONField(null=True,
                             blank=True,
                             verbose_name="Book as Json Hebrew")

    def __str__(self):
        return f'{self.book.book.book_title_en} {self.book.book.book_title_he:>20}'

    class Meta:
        verbose_name_plural = "Books as Json"


class Ref(models.Model):
    """  References """
