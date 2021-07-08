from django.contrib.postgres.fields import ArrayField
from django.utils.safestring import mark_safe
from django.db import models
from django.utils.translation import gettext as _
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL,
                        LANGUAGES,
                        BOOK_CLASSIFICATION)
from tinymce.models import HTMLField
from .hebrew_numbers import indo_arabic_to_hebrew


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

    def to_book_list(self):
        return [self.get_first_level_display(),
                self.get_second_level_display(),
                self.book_title_en,
                self.book_title_he,
                self.chapters,
                self.verses
                ]

    @mark_safe
    def chapter_show(self):
        return f"""<p style="text-align:right">{self.chapters}</p>"""

    chapter_show.short_description = "Chapters"

    @staticmethod
    def get_list_of_books():
        """ Return list of book """
        books = Organization.objects.all().order_by('first_level',
                                                    'second_level',
                                                    'order')
        # data = []
        # temp = []
        # i = 0
        # count = books.count()
        # while i < count:
        #     level = books[i]
        #     book = level
        #     page = 0
        #     while book['second_level'] == level['second_level']:
        #         temp.append(books[i])
        #         i += 1
        #         page += 1
        #         #  we want to display 3 books in a line
        #         if i >= count or page % 3 == 0:
        #             break
        #         book = books[i]
        #
        #     # make sure that exists 3 elements in each row
        #     while len(temp) < 3:
        #         temp.append([])
        #
        #     data.append(temp)
        #
        #     temp = []
        data = []
        for book in books:
            data.append(book.to_book_list())
        return data

    class Meta:
        verbose_name_plural = _("    Architecture")
        ordering = ['order']


class Author(models.Model):
    """
        Who is the Author
    """

    name = models.CharField(max_length=50)

    comments_count_en = models.IntegerField(default=0,
                                            editable=False,
                                            verbose_name=_('Comments English'))

    comments_count_he = models.IntegerField(default=0,
                                            editable=False,
                                            verbose_name=_('Comment Hebrew'))

    history = models.TextField(null=True,
                               blank=True,
                               verbose_name=_("History"))

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name_plural = "Author's"


class OtherBooks(models.Model):
    """ Other books relate do bible but no biblical text"""

    class BookClassification(models.IntegerChoices):
        COMMENTARIES = 1
        OTHER = 100

    book_title_en = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title English"))

    book_title_he = models.CharField(max_length=100,
                                     null=True,
                                     blank=True,
                                     verbose_name=_("Book title Hebrew"))

    author = models.ForeignKey(Author,
                               on_delete=models.CASCADE,
                               verbose_name=_('Author')
                               )

    classification = models.SmallIntegerField(choices=BookClassification.choices,
                                              verbose_name=_('Book classification'))

    def __str__(self):
        return self.book_title_en

    class Meta:
        verbose_name_plural = _("  Other books")


class Comment(models.Model):
    """
       Comments on chapter / verse
    """
    book = models.ForeignKey(Organization,
                             null=True,
                             blank=True,
                             on_delete=models.CASCADE,
                             verbose_name=_('Comments on Book'))

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

    comment_author = models.ForeignKey(Author,
                                       null=True,
                                       blank=True,
                                       on_delete=models.DO_NOTHING,
                                       verbose_name=_('Author'))

    source_book = models.ForeignKey(OtherBooks,
                                    null=True,
                                    blank=True,
                                    on_delete=models.CASCADE,
                                    verbose_name=_('Source book'))

    foot_notes_en = ArrayField(models.TextField(), default=list, null=True, blank=True)

    foot_notes_he = ArrayField(models.TextField(), default=list, null=True, blank=True)

    def __str__(self):
        return f"{self.comment_author} - {self.book}"

    def to_json_book_details(self):
        """ We dont need to send book details with every comment"""
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'author': self.comment_author.name,
                'comment_count_en': self.comment_author.comments_count_en,
                'comment_count_he': self.comment_author.comments_count_he
                }

    def to_json(self):
        """ Serialize instance to json"""
        return {'id': self.book.id,
                'comment_en': self.comment_en,
                'comment_he': self.comment_he,
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

    @mark_safe
    def foot_note_en_admin(self):
        html = ''
        for foot_note in self.foot_notes_en:
            html += f'<p>{foot_note}</p>'
        return html

    foot_note_en_admin.short_description = "Foot notes EN"

    @mark_safe
    def foot_note_he_admin(self):
        html = ''
        for foot_note in self.foot_notes_he:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    foot_note_he_admin.short_description = "Foot notes HE"

    def save(self, *args, **kwargs):
        """ Update books comment count if new comment"""

        update_count_en = 0
        update_count_he = 0

        book_text = BookText.objects.get(book=self.book,
                                         chapter=self.chapter,
                                         verse=self.verse)
        if self.pk is None:
            if self.comment_en != '':
                update_count_en = 1
            if self.comment_he != '':
                update_count_he = 1
        else:
            # editing a record
            previous_state = Comment.objects.get(pk=self.pk)
            if previous_state.comment_en == '' and self.comment_en != '':
                update_count_en = 1
            if previous_state.comment_en != '' and self.comment_en == '':
                update_count_en = -1
            if previous_state.comment_he == '' and self.comment_he != '':
                update_count_he = 1
            if previous_state.comment_he != '' and self.comment_he == '':
                update_count_he = -1

        book_text.comments_count_en += update_count_en
        book_text.comments_count_he += update_count_he
        book_text.save()

        book_as_array = BookAsArray.objects.get(book=self.book, chapter=self.chapter)
        verse = self.verse - 1
        book_as_array.book_text[verse][2] = book_text.comments_count_en
        book_as_array.book_text[verse][3] = book_text.comments_count_he
        book_as_array.save()

        self.comment_author.comments_count_en += update_count_en
        self.comment_author.comments_count_he += update_count_he
        self.comment_author.save()

        super(Comment, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        """ Update books comment count and Author comment count """
        book_text = BookText.objects.get(book=self.book,
                                         chapter=self.chapter,
                                         verse=self.verse)
        if self.comment_en != '':
            book_text.comments_count_en -= 1
            self.comment_author.comments_count_en -= 1

        if self.comment_he != '':
            book_text.comments_count_he -= 1
            self.comment_author.comments_count_he -= 1

        book_text.save()
        self.comment_author.save()

        super(Comment, self).delete(using=using, keep_parents=keep_parents)

    class Meta:
        verbose_name_plural = "Commentaries"
        ordering = ('book', 'chapter', 'verse', 'pk')


class CommentTmp(models.Model):
    """ This can safely be delete after all comment are
        load.
    """
    book = models.ForeignKey(Organization,
                             null=True,
                             blank=True,
                             on_delete=models.CASCADE,
                             verbose_name=_('Comments on Book'))

    chapter = models.IntegerField(default=1,
                                  verbose_name=_("Chapter"))

    verse = models.IntegerField(default=1,
                                verbose_name=_("Verse"))

    comment_number = models.SmallIntegerField(default=0,
                                              verbose_name=_("Comment Number"))

    comment_en = HTMLField(null=True,
                           blank=True,
                           verbose_name=_("Comment English"))

    comment_he = HTMLField(null=True,
                           blank=True,
                           verbose_name=_("Comment Hebrew"))

    comment_author = models.ForeignKey(Author,
                                       null=True,
                                       blank=True,
                                       on_delete=models.DO_NOTHING,
                                       verbose_name=_('Author'))

    source_book = models.ForeignKey(OtherBooks,
                                    null=True,
                                    blank=True,
                                    on_delete=models.CASCADE,
                                    verbose_name=_('Source book'))

    foot_notes_en = ArrayField(models.TextField(), default=list, null=True, blank=True)

    foot_notes_he = ArrayField(models.TextField(), default=list, null=True, blank=True)

    def __str__(self):
        return f"{self.comment_author} - {self.book}"

    def to_json_book_details(self):
        """ We dont need to send book details with every comment"""
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'author': self.comment_author.name,
                'comment_count_en': self.comment_author.comments_count_en,
                'comment_count_he': self.comment_author.comments_count_he
                }

    def to_json(self):
        """ Serialize instance to json"""
        return {'id': self.book.id,
                'comment_en': self.comment_en,
                'comment_he': self.comment_he,
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

    @mark_safe
    def foot_note_en_admin(self):
        html = ''
        for foot_note in self.foot_notes_en:
            html += f'<p>{foot_note}</p>'
        return html

    foot_note_en_admin.short_description = "Foot notes EN"

    @mark_safe
    def foot_note_he_admin(self):
        html = ''
        for foot_note in self.foot_notes_he:
            html += f'<p>{foot_note}</p>'
        return html

    foot_note_he_admin.short_description = "Foot notes HE"

    class Meta:
        verbose_name_plural = 'Comments Tmp'
        ordering = ('book', 'chapter', 'verse', 'comment_number')


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
                               verbose_name=_("English text"))

    text_he = models.TextField(null=True,
                               verbose_name=_("Hebrew text"))

    comments_count_en = models.IntegerField(default=0,
                                            editable=False,
                                            verbose_name=_("EN Cmt."))

    comments_count_he = models.IntegerField(default=0,
                                            editable=False,
                                            verbose_name=_("HE Cmt."))

    def __str__(self):
        return f'{self.book.book_title_en}           {self.book.book_title_he:>40}'

    def verse_he(self):
        return indo_arabic_to_hebrew(self.verse)

    def chapter_he(self):
        return indo_arabic_to_hebrew(self.chapter)

    @mark_safe
    def book_he_admin(self):
        return self.book.book_title_he

    book_he_admin.short_description = 'Book_he'

    @mark_safe
    def verse_he_admin(self):
        return self.verse_he()

    verse_he_admin.short_description = "verse_he"

    @mark_safe
    def chapter_he_admin(self):
        return self.chapter_he()

    chapter_he_admin.short_description = "chapter_he"

    def to_json(self):
        """Serialize instance to json"""
        return {'id': self.book.id,
                'book_title_en': self.book.book_title_en,
                'book_title_he': self.book.book_title_he,
                'chapter': self.chapter,
                'chapter_he': self.chapter_he(),
                'verse': self.verse,
                'verse_he': self.verse_he(),
                'text_en': self.text_en,
                'text_he': self.text_he,
                'comments_count_en': self.comments_count_en,
                'comments_count_he': self.comments_count_he,
                }

    @staticmethod
    def to_json_books(book, chapter, verse=None, stop_verse=None):
        """ Serialize several instances"""

        if chapter is None and verse is None and stop_verse is None:
            book_text = BookText.objects.filter(book=book)
        elif verse is None and stop_verse is None:
            book_text = BookText.objects.filter(book=book, chapter=chapter)
        elif verse is not None and stop_verse is None:
            book_text = BookText.objects.filter(book=book, chapter=chapter, verse=verse)
        elif verse is not None and stop_verse is not None:
            book_text = BookText.objects.filter(book=book, chapter=chapter, verse__gte=verse, verse__lte=stop_verse)
        else:
            # error on parameters
            pass

        result = []
        for book in book_text:
            result.append(book.to_json())
        return result

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

    # text english, text hebrew, comment_count and Verse
    book_text = ArrayField(ArrayField(models.TextField(), size=6), default=list)

    @mark_safe
    def text(self):
        html = '<table><tbody>'
        for text in self.book_text:
            html += f'<tr>'
            html += f'<td>{text[2]}</td><td class="en-verse">{text[0]}</td>'
            html += f'<td>{text[4]}</td>'
            html += f'<td class="he-verse" dir=\'rtl\'>{text[1]}</td><td>{text[3]}</td></tr>'
        html += '</tbody></table>'
        return html

    text.short_description = "Book Text"

    def to_json(self):
        return {
            'text': self.book_text
        }

    @staticmethod
    def to_list(book, chapter=None):
        result = []
        if chapter is None:
            query = BookAsArray.objects.filter(book=book)
            for book in query:
                result += book.book_text
            return result

        else:
            query = BookAsArray.objects.filter(book=book, chapter=chapter)
            return query[0].book_text

    @staticmethod
    def to_json_book_array(book, chapter=None):
        """ deprecated """
        result = []
        if chapter is None:
            query = BookAsArray.objects.filter(book=book)
        else:
            query = BookAsArray.objects.filter(book=book, chapter=chapter)

        for i, book in enumerate(query):
            result.append(book.to_json())

        return result

    def __str__(self):
        return self.book.book_title_en

    class Meta:
        ordering = ('book', 'chapter')


class KaraitesBookDetails(models.Model):
    """  Karaites books """

    book_language = models.CharField(max_length=2,
                                     choices=LANGUAGES,
                                     verbose_name=_('Book language'))

    book_classification = models.CharField(max_length=2,
                                           choices=BOOK_CLASSIFICATION,
                                           verbose_name=_('Classification'))

    author = models.ForeignKey(Author,
                               blank=True,
                               null=True,
                               on_delete=models.CASCADE,
                               verbose_name=_('Book Author')
                               )

    book_title = models.CharField(max_length=100,
                                  verbose_name=_('Book_title'))

    def __str__(self):
        return self.book_title

    @staticmethod
    def to_json(book_title):
        details = KaraitesBookDetails.objects.get(book_title=book_title)
        return {
            'book_id': details.id,
            'book_language': details.book_language,
            'book_classification': details.book_classification,
            'author': details.author.name,
            'book_title': details.book_title
        }

    class Meta:
        verbose_name_plural = 'Karaites book details'


class KaraitesBookText(models.Model):
    """ """
    book = models.ForeignKey(KaraitesBookDetails,
                             on_delete=models.CASCADE,
                             verbose_name=_('Karaite book details')
                             )

    chapter_number = models.IntegerField(default=0,
                                         verbose_name=_('Chapter #'))

    chapter_number_la = models.CharField(max_length=4,
                                         null=True,
                                         blank=True,
                                         verbose_name=_('Chapter #'))

    chapter_title = models.TextField(null=True,
                                     blank=True,
                                     verbose_name=_('Chapter title'))

    chapter_text = models.TextField(verbose_name=_('Chapter text'))

    foot_notes = ArrayField(models.TextField(), default=list, null=True, blank=True)

    def __str__(self):
        return self.book.book_title

    @staticmethod
    def to_json(book, chapter_number):
        chapter = KaraitesBookText.objects.get(book=book, chapter_number=chapter_number)
        return {
            'index': 1,
            'chapter_number': chapter.chapter_number,
            'chapter_number_la': chapter.chapter_number_la,
            'chapter_title': chapter.chapter_title,
            'chapter_text': chapter.chapter_text,
        }

    @staticmethod
    def to_list(book, chapter_number=None):
        if chapter_number is None:
            query = KaraitesBookText.objects.filter(book=book)
        else:
            query = KaraitesBookText.objects.filter(book=book, chapter_number=chapter_number)

        result = []
        for book in query:
            result.append([book.chapter_title + book.chapter_text, book.chapter_number, book.chapter_number_la])
        return result

    @mark_safe
    def chapter_number_la_admin(self):
        return self.chapter_number_la

    chapter_number_la_admin.short_description = 'Chapter #'

    @mark_safe
    def chapter_title_admin(self):
        return self.chapter_title

    chapter_title_admin.short_description = 'Chapter Title'

    @mark_safe
    def chapter_text_admin(self):
        return self.chapter_text

    chapter_text_admin.short_description = 'Chapter Text'

    @mark_safe
    def foot_notes_admin(self):
        html = ''
        for foot_note in self.foot_notes:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    foot_notes_admin.short_description = 'Foot notes'

    class Meta:
        verbose_name_plural = 'Karaites book text'
