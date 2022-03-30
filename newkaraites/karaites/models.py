from django.contrib.postgres.fields import ArrayField
from django.utils.safestring import mark_safe
from django.db import models
from django.utils.translation import gettext as _
from .constants import (FIRST_LEVEL,
                        SECOND_LEVEL,
                        LANGUAGES,
                        BOOK_CLASSIFICATION,
                        AUTOCOMPLETE_TYPE,
                        REF_ERROR_CODE)

from tinymce.models import HTMLField
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex


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
                                     verbose_name=_("Bible book title English"))

    summary_en = models.TextField(default='',
                                  verbose_name=_('Summary English'))

    book_title_he = models.CharField(max_length=100,
                                     null=True,
                                     verbose_name=_("Book title Hebrew"))

    summary_he = models.TextField(default='',
                                  verbose_name=_('Summary Hebrew'))

    chapters = models.IntegerField(default=1,
                                   verbose_name=_("How many chapters in this book"))

    verses = ArrayField(models.IntegerField(),
                        null=True,
                        blank=True,
                        editable=False,
                        verbose_name=_("How many verses in each chapter"))

    total_verses = models.IntegerField(default=0)

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
                'total_verses': self.total_verses,
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

    class Meta:
        verbose_name_plural = _("    Architecture")
        ordering = ['order']


class Author(models.Model):
    """
        Who is the Author
    """

    name = models.CharField(max_length=100)

    name_he = models.CharField(max_length=100,
                               default='')

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
        """ We don't need to send book details with every comment"""
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
                'book': self.book.book_title_en,
                'chapter': self.chapter,
                'verse': self.verse,
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
            query = Comment.objects.filter(book=book,
                                           chapter=chapter,
                                           verse=verse)

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

        book_as_array = BookAsArray.objects.get(book=self.book, chapter=self.chapter)
        verse = self.verse - 1
        book_as_array.book_text[verse][2] = int(book_as_array.book_text[verse][2]) + update_count_en
        book_as_array.book_text[verse][3] = int(book_as_array.book_text[verse][3]) + update_count_he
        book_as_array.save()

        self.comment_author.comments_count_en += update_count_en
        self.comment_author.comments_count_he += update_count_he
        self.comment_author.save()

        super(Comment, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        """ Update books comment count and Author comment count """

        if self.comment_en != '':
            self.comment_author.comments_count_en -= 1

        if self.comment_he != '':
            self.comment_author.comments_count_he -= 1

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
        """ We don't need to send book details with every comment"""
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


class BookAsArray(models.Model):
    """ Map Biblical book to postgresql array field """

    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name="Book"
                             )

    chapter = models.IntegerField(default=0)

    # [text english, text hebrew, comment count En, comment count He,
    # Verse number , Chapter, need render chapter title,
    # number of  Halakhah references]
    book_text = ArrayField(ArrayField(models.TextField(), size=8), default=list)

    @mark_safe
    def text(self):
        html = '<table><tbody>'
        for text in self.book_text:
            html += '<tr>'
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
    def to_list(book, chapter=None, book_title=None, first=None):
        def flat(query):
            result = []
            for book in query:
                result += book.book_text
            return result

        # if book is less them 11 chapters, read all book
        if book_title.chapters <= 10:
            chapter = None

        if chapter is None:
            query = BookAsArray.objects.filter(book=book)
        else:
            if first == 0:
                query = BookAsArray.objects.filter(book=book, chapter__gte=1, chapter__lte=chapter)
            else:
                query = BookAsArray.objects.filter(book=book, chapter=chapter)

        return flat(query)

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
        verbose_name_plural = _('Biblical books as array')


class KaraitesBookDetails(models.Model):
    """  Karaites books """

    first_level = models.IntegerField(default=0,
                                      choices=FIRST_LEVEL,
                                      verbose_name=_('Law'))

    book_language = models.CharField(max_length=8,
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

    book_title_en = models.CharField(max_length=100,
                                     default='',
                                     verbose_name=_('Title English'))

    book_title_he = models.CharField(max_length=100,
                                     default='',
                                     verbose_name=_('Title Hebrew'))

    book_title_unslug = models.CharField(max_length=100,
                                         editable=False,
                                         default='')

    introduction = models.TextField(default='')

    table_book = models.BooleanField(default=False)

    columns = models.IntegerField(default=0)

    columns_order = models.CharField(max_length=10, default='')

    toc_columns = models.CharField(max_length=10, default='')

    direction = models.CharField(max_length=3,default='rtl')

    remove_class = models.CharField(max_length=100, default='')

    remove_tags = models.CharField(max_length=100, default='')

    # book has more than on table
    multi_tables = models.BooleanField(default=False)

    def __str__(self):
        return self.book_title_en

    @mark_safe
    def intro_to_html(self):
        return self.introduction

    @staticmethod
    def get_all_books_by_first_level(level, classification=False):

        if not classification:
            book_details = KaraitesBookDetails.objects.filter(first_level=level).order_by('book_title_en')
        else:
            # Halakhah, Polemic
            if level == '3':
                book_details = KaraitesBookDetails.objects.filter(first_level=level).order_by('book_title_en',
                                                                                              'book_classification')
            else:
                book_details = KaraitesBookDetails.objects.filter(first_level=level).order_by('first_level',
                                                                                              'book_classification',
                                                                                              'book_title_en')

        data = []
        for details in book_details:
            data.append({
                'book_id': details.id,
                'book_first_level': details.first_level,
                'book_language': details.book_language,
                'book_classification': details.get_book_classification_display(),
                'book_title_en': details.book_title_en,
                'book_title_he': details.book_title_he,
                'columns': details.columns,
                'columns_order': details.columns_order,
                'toc_columns': details.toc_columns,
                'table_book': details.table_book,
                'direction': details.direction,
                'remove_class': details.remove_class,
                'remove_tags': details.remove_tags,
                'multi_tables': details.multi_tables
            })
        return data

    @staticmethod
    def to_json(book_title_unslug):
        details = KaraitesBookDetails.objects.get(book_title_unslug__startswith=book_title_unslug)
        toc = TableOfContents.objects.filter(karaite_book=details)

        return {
            'book_id': details.id,
            'book_first_level': details.first_level,
            'book_language': details.book_language,
            'book_classification': details.get_book_classification_display(),
            'author': details.author.name,
            'book_title_en': details.book_title_en,
            'book_title_he': details.book_title_he,
            'table_book': details.table_book,
            'columns': details.columns,
            'columns_order': details.columns_order,
            'toc_columns': details.toc_columns,
            'toc': [t.to_list() for t in toc],
            'intro': details.introduction,
            'direction': details.direction,
            'remove_class': details.remove_class,
            'remove_tags': details.remove_tags,
            'multi_tables': details.multi_tables,
        }

    def save(self, *args, **kwargs):

        self.book_title_unslug = self.book_title_en

        super(KaraitesBookDetails, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = 'Karaites book details'
        ordering = ('book_title_en', 'author')


class KaraitesBookAsArray(models.Model):
    book = models.ForeignKey(KaraitesBookDetails,
                             on_delete=models.CASCADE,
                             verbose_name=_('Karaite book details')
                             )

    ref_chapter = models.CharField(max_length=260,
                                   default='',
                                   verbose_name=_('Reference/Chapter'))

    paragraph_number = models.IntegerField(default=0)

    # [paragraph English, page number, page number hebrew, is_title, paragraph Hebrew]
    book_text = ArrayField(ArrayField(models.TextField()), default=list)

    foot_notes = ArrayField(models.TextField(), default=list, null=True, blank=True)

    def __str__(self):
        return f'{self.book.book_title_en}  -   {self.book.book_title_he}'

    @staticmethod
    def to_list(book, paragraph_number, first):
        # chapters don't exist so we read paragraphs
        LIMIT = 100
        if first == 0:
            query = KaraitesBookAsArray.objects.filter(book=book, paragraph_number__gte=0,
                                                       paragraph_number__lte=paragraph_number)
        else:
            query = KaraitesBookAsArray.objects.filter(book=book, paragraph_number__gt=paragraph_number)[0:LIMIT]

        result = []
        for book in query:
            result.append([book.ref_chapter, book.paragraph_number, book.book_text])
        return [result, query.count()]

    @mark_safe
    def text(self):
        html = '<table><tbody><tr>'
        html += f'<td class="he-verse" dir=\'rtl\'>{self.book_text[0]}</td>'
        try:
            html += f'<td class="he-verse" dir=\'rtl\'>{self.book_text[2]}</td>'
        except IndexError:
            pass
        html += '</tr></tbody></table>'
        return mark_safe(html)

    text.short_description = "Book Text"

    @mark_safe
    def foot_notes_admin(self):
        html = ''
        for foot_note in self.foot_notes:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    foot_notes_admin.short_description = 'Foot notes'

    class Meta:
        ordering = ('paragraph_number', 'book', 'ref_chapter')
        verbose_name_plural = 'Karaites book text as array'


class TableOfContents(models.Model):
    """ Karaites Books table of contents"""

    karaite_book = models.ForeignKey(KaraitesBookDetails,
                                     on_delete=models.CASCADE,
                                     verbose_name=_('Karaite book'))

    subject = ArrayField(models.TextField(), default=list, null=True, blank=True)

    start_paragraph = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.karaite_book.book_title_en}  -   {self.karaite_book.book_title_he}'

    @mark_safe
    def admin_subject(self):
        return f'<span class="toc">{self.subject[0]}</span><span class="index">{self.subject[1]}</span>'

    admin_subject.short_description = "Toc"

    def to_json(self):
        return {'subject': self.subject[0],
                'index': self.subject[1],
                'start_paragraph': self.start_paragraph
                }

    def to_list(self):
        return [self.subject[0],
                self.subject[1],
                self.start_paragraph
                ]

    class Meta:
        verbose_name_plural = _('Karaites  table of contents')
        ordering = ('start_paragraph',)


class References(models.Model):
    """ References between karaite books and Bible books"""

    karaites_book = models.ForeignKey(KaraitesBookDetails,
                                      on_delete=models.CASCADE,
                                      verbose_name=_('Karaites book'))

    paragraph_number = models.IntegerField(default=0,
                                           verbose_name=_('Karaites paragraph that references Bible book'))

    paragraph_text = ArrayField(ArrayField(models.TextField()), default=list)

    foot_notes = ArrayField(models.TextField(), default=list, null=True, blank=True)

    bible_ref_he = models.CharField(max_length=40,
                                    default='',
                                    verbose_name=_('ref. Hebrew'))

    bible_ref_en = models.CharField(max_length=40,
                                    default='',
                                    verbose_name=_('ref. English'))

    error = models.CharField(max_length=2,
                             choices=REF_ERROR_CODE,
                             default='',
                             verbose_name=_('error'))

    def __str__(self):
        return f'{self.karaites_book.book_title_en} on paragraph {self.paragraph_number} references to: {self.bible_ref_en}'

    @mark_safe
    def paragraph_admin(self):
        return self.paragraph_text[0]

    paragraph_admin.short_description = 'Reference text'

    @mark_safe
    def foot_notes_admin(self):
        html = ''
        for foot_note in self.foot_notes:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    def to_json(self):
        return {'book_name_en': self.karaites_book.book_title_en,
                'book_name_he': self.karaites_book.book_title_he,
                'author': self.karaites_book.author.name,
                'language': self.karaites_book.book_language,
                'paragraph_number': self.paragraph_number,
                'paragraph_html': self.paragraph_text[0],
                'bible_ref_he': self.bible_ref_he,
                'bible_ref_en': self.bible_ref_en,
                }

    @staticmethod
    def to_list(bible_ref_en):

        result = []
        for ref in References.objects.filter(bible_ref_en=bible_ref_en):
            result.append(ref.to_json())

        return result

    class Meta:
        verbose_name_plural = _('Karaites Bible references.')


class AutoComplete(models.Model):
    word_en = models.CharField(max_length=100,
                               db_index=True)

    classification = models.CharField(max_length=1,
                                      choices=AUTOCOMPLETE_TYPE,
                                      default='V'
                                      )

    word_count = models.IntegerField(default=1)

    class Meta:
        ordering = ('word_en', '-word_count')


class FullTextSearch(models.Model):
    reference_en = models.CharField(max_length=100, default='')

    text_en = models.TextField(default='')

    text_en_search = SearchVectorField(null=True)

    reference_he = models.CharField(max_length=100, default='')

    text_he = models.TextField(default='')

    text_he_search = SearchVectorField(null=True)

    # False entry is human curated, so don't delete on rebuild database
    delete = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.reference_en

    def to_dict(self):
        """ Make a dictionary of the object """
        return {'reference_en': self.reference_en,
                'text_en': self.text_en,
                }

    class Meta:
        verbose_name_plural = 'Full text search'
        indexes = [GinIndex(fields=["text_en_search"])]
