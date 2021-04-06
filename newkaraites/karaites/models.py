from django.db import models
from django.utils.translation import gettext as _
from .constants import LANGUAGES


class Organization(models.Model):
    """
        Books order
    """

    book_title_en = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title English"))

    book_title_he = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title Hebrew"))

    order = models.IntegerField(default=0,
                                db_index=True,
                                verbose_name=_('Presentation order'))

    def __str__(self):
        return f"{self.book_title_en}"

    class Meta:
        verbose_name_plural = _("Organizations")
        ordering = ['order']


class CommentAuthor(models.Model):
    """
        Who made the comment
    """

    name = models.CharField(max_length=50)

    history = models.TextField(null=True,
                               verbose_name=_("History"))

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name_plural = "Comment Author"


class Comment(models.Model):
    """
       Comments on chapter / verse
    """

    comment = models.TextField(null=True,
                               verbose_name=_("A comment"))

    comment_language = models.CharField(max_length=2,
                                        choices=LANGUAGES,
                                        verbose_name=_('Comment language'))

    comment_author = models.ForeignKey(CommentAuthor,
                                       on_delete=models.DO_NOTHING,
                                       verbose_name=_('Who comment'))

    def __str__(self):
        return f"{self.comment_author}"

    class Meta:
        verbose_name_plural = "Comments"


class BookText(models.Model):
    """
       A bible book text
    """

    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name=_('Book'))

    chapter_en = models.IntegerField(default=0,
                                     verbose_name=_("Chapter"))

    verse_en = models.IntegerField(default=0,
                                   verbose_name=_("Verse"))
    chapter_he = models.IntegerField(default=0,
                                     verbose_name=_("Chapter"))

    verse_he = models.IntegerField(default=0,
                                   verbose_name=_("Verse"))

    text_en = models.TextField(null=True,
                               verbose_name=_("English chapter Verse text"))

    text_he = models.TextField(null=True,
                               verbose_name=_("Hebrew chapter Verse text"))

    comments = models.ManyToManyField(Comment)

    def __str__(self):
        return f"{self.book.book_title_en}"

    class Meta:
        verbose_name_plural = _("Book text")


class Ref(models.Model):
    """  References """
