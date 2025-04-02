import os
from ast import literal_eval
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils.safestring import mark_safe
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.contrib.auth.models import User
from .validatores.validators import validate_time
from .utils import (convert_seconds_to_time,
                    convert_time_to_seconds,
                    slug_back)
from .constants import (LANGUAGES,
                        AUTOCOMPLETE_TYPE,
                        REF_ERROR_CODE,
                        VERSE_TABLE)

VERSE = 4
HEBREW = 0
ENGLISH = 1


class FirstLevel(models.Model):
    first_level = models.CharField(max_length=50,
                                   unique=True,
                                   verbose_name=_('First level English'),
                                   help_text=_('First level in English'))

    first_level_he = models.CharField(max_length=50,
                                      default='',
                                      blank=True,
                                      verbose_name=_('First level in Hebrew'),
                                      help_text=_('First level in Hebrew'))

    order = models.IntegerField(default=0,
                                verbose_name=_('Display order'))

    break_on_classification = models.BooleanField(default=False,
                                                  verbose_name=_('Break on classification'),
                                                  help_text=_('Break on classification ex.:Liturgy'))

    url = models.CharField(max_length=20,
                           default='',
                           verbose_name=_('URL'),
                           help_text=_('URL should be only one word without spaces'
                                       ' don\'t change the older ones. Keep then in English'))

    def __str__(self):
        return self.first_level

    @mark_safe
    def first_level_he_html(self):
        return f'<p dir="rtl">{self.first_level_he}</p>'

    class Meta:
        verbose_name = _('     First Level')
        verbose_name_plural = _('     First Level')
        ordering = ['order', 'first_level']


class SecondLevel(models.Model):
    second_level = models.CharField(max_length=50,
                                    unique=True)

    second_level_he = models.CharField(max_length=50,
                                       default='',
                                       blank=True)

    order = models.IntegerField(default=0)

    def __str__(self):
        return self.second_level

    @mark_safe
    def second_level_he_html(self):
        return f'<p dir="rtl">{self.second_level_he}</p>'

    class Meta:
        verbose_name = _('      Second Level')
        verbose_name_plural = _('     Second Level')
        ordering = ('order', 'second_level')


class Organization(models.Model):
    """
        Books order
    """

    first_level = models.ForeignKey(FirstLevel,
                                    blank=False,
                                    null=False,
                                    on_delete=models.DO_NOTHING,
                                    verbose_name=_('Law'))

    second_level = models.ForeignKey(SecondLevel,
                                     blank=False,
                                     null=False,
                                     on_delete=models.DO_NOTHING,
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
                'audio_books': BookAsArrayAudio.get_audio_list(self.id),
                }

    def to_book_list(self):
        return [self.first_level.first_level,
                self.second_level.second_level,
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

    name = models.CharField(max_length=100,
                            verbose_name=_('Author Name in English'),
                            help_text=_('Author Name in English'))

    name_he = models.CharField(max_length=100,
                               default='',
                               blank=True,
                               verbose_name=_('Author name in Hebrew'),
                               help_text=_('Name in Hebrew if any'))

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
        verbose_name_plural = " Author's"


class BookAsArray(models.Model):
    """ Map Biblical book to postgresql array field """

    book = models.ForeignKey(Organization,
                             on_delete=models.CASCADE,
                             verbose_name="Book"
                             )

    chapter = models.IntegerField(default=0)

    # [text english, text hebrew, _, _,
    # Verse number , Chapter, need render chapter title,
    # two positions for each first level reference
    # example Halakhah 1 reference English, 3 references in Hebrew for this book chapter and verse
    # Liturgy  0 reference English, 10 references in Hebrew for this book chapter and verse
    # Poetry   2 reference English, 0 references in Hebrew for this book chapter and verse
    # and so on for each first level
    # 0 text english,
    # 1 text hebrew,
    # 2 reserved,
    # 3 reserved,
    # 4 Verse number,
    # 5 Chapter,
    # 6 need render chapter title,
    # 7 Total bible references in Hebrew,
    # 8 Total bible references in English,
    # 9 [Halakhah Hebrew, Liturgy Hebrew, Poetry Hebrew, Exhortatory Hebrew Comments Hebrew],
    # 10 [Halakhah English, Liturgy English, Poetry English, Exhortatory English Comments English],
    # 10 Halakhah English
    # 11 [start_ms, end_ms, id]  hebrew audio start and end time in milliseconds, [0,0,0] means no audiobook
    #     id is audio file id in AudioBooks table
    # ...]

    book_text = ArrayField(ArrayField(models.TextField()), default=list)

    @mark_safe
    def text(self):
        html = '<table><tbody>'
        for text in self.book_text:
            start, end, file = literal_eval(text[11])
            html += '<tr>'
            html += f'<td>{text[VERSE]}</td><td class="en-verse">{text[HEBREW]}</td>'
            html += f'<td class="he-verse" dir=\'rtl\'>{text[ENGLISH]}</td>'
            html += f'<td>{start}</td>'
            html += f'<td>{end}</td>'
            html += f'<td>{file}</td>'
            html += '</tr>'
            # html += f'<tr><td>{text}</td></tr>'
        html += '</tbody></table>'
        return html

    text.short_description = "Book Text"

    def to_json(self):
        return {
            'text': self.book_text
        }

    @staticmethod
    def to_list(book, chapter=None, book_title=None, first=None):

        def flat(query_set):
            result = []
            for text in query_set:
                result += text.book_text
            return result

        # if a book is less them 11 chapters, read all books
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

    # todo: remove this method
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
        verbose_name_plural = _(' Biblical books')


class Parsha(models.Model):
    """ Parsha """

    book = models.ForeignKey(Organization,
                             on_delete=models.DO_NOTHING,
                             verbose_name=_('Book'),
                             help_text=_('Book'))

    order = models.IntegerField(default=0,
                                verbose_name=_('Order'),
                                help_text=_('Order'))

    parsha_he = models.CharField(max_length=50,
                                 verbose_name=_('Parsha'),
                                 help_text=_('Parsha'))

    parsha_en = models.CharField(max_length=50,
                                 verbose_name=_('Parsha in English'),
                                 help_text=_('Parsha in English'))

    parsha_portion = models.CharField(max_length=20,
                                      verbose_name=_('Parsha portion'),
                                      help_text=_('Parsha portion'))

    first_reading = models.CharField(max_length=30,
                                     default='',
                                     verbose_name=_('First reading'),
                                     help_text=_('First reading'))

    first_description = models.TextField(blank=True,
                                         null=True,
                                         verbose_name=_('First reading description'),
                                         help_text=_('First reading description'))

    second_reading = models.CharField(max_length=30,
                                      default='',
                                      verbose_name=_('Second reading'),
                                      help_text=_('Second reading'))

    second_description = models.TextField(blank=True,
                                          null=True,
                                          verbose_name=_('Second reading description'),
                                          help_text=_('Second reading description'))

    third_reading = models.CharField(max_length=30,
                                     verbose_name=_('Third reading'),
                                     help_text=_('Third reading'))

    third_description = models.TextField(blank=True,
                                         null=True,
                                         verbose_name=_('Third reading description'),
                                         help_text=_('Third reading description'))

    fourth_reading = models.CharField(max_length=30,
                                      verbose_name=_('Fourth reading'),
                                      help_text=_('Fourth reading'))

    fourth_description = models.TextField(blank=True,
                                          null=True,
                                          verbose_name=_('Fourth reading description'),
                                          help_text=_('Fourth reading description'))

    fifth_reading = models.CharField(max_length=30,
                                     verbose_name=_('Fifth reading'),
                                     help_text=_('Fifth reading'))

    fifth_description = models.TextField(blank=True,
                                         null=True,
                                         verbose_name=_('Fifth reading description'),
                                         help_text=_('Fifth reading description'))

    sixth_reading = models.CharField(max_length=30,
                                     verbose_name=_('Sixth reading'),
                                     help_text=_('Sixth reading'))

    sixth_description = models.TextField(blank=True,
                                         null=True,
                                         verbose_name=_('Sixth reading description'),
                                         help_text=_('Sixth reading description'))

    seventh_reading = models.CharField(max_length=30,
                                       verbose_name=_('Seventh reading'),
                                       help_text=_('Seventh reading'))

    seventh_description = models.TextField(blank=True,
                                           null=True,
                                           verbose_name=_('Seventh reading description'),
                                           help_text=_('Seventh reading description'))

    def __str__(self):
        return f"{self.parsha_en}"

    @mark_safe
    def readings(self):
        html = '<table>'
        html += '<thead><tr><th>Reading</th><th>Parsha Portion</th></tr></thead>'
        html += f'<tr><td>1 st</td><td>{self.first_reading}</td></tr>'
        html += f'<tr><td>2 nd</td><td>{self.second_reading}</td></tr>'
        html += f'<tr><td>3 rd</td><td>{self.third_reading}</td></tr>'
        html += f'<tr><td>4 th</td><td>{self.fourth_reading}</td></tr>'
        html += f'<tr><td>5 th</td><td>{self.fifth_reading}</td></tr>'
        html += f'<tr><td>6 th</td><td>{self.sixth_reading}</td></tr>'
        html += f'<tr><td>7 th</td><td>{self.seventh_reading}</td></tr>'
        html += '</table>'
        return html

    class Meta:
        verbose_name_plural = "Parsha's"
        ordering = ('order',)


class AudioBook(models.Model):
    """ Audiobooks typically parsha, but not limited to"""

    audio_name = models.CharField(max_length=100,
                                  verbose_name=_('Audiobook name'),
                                  help_text=_('Audio name'))

    audio_file = models.FileField(upload_to='audio-books/',
                                  verbose_name=_('Audiobook file'),
                                  help_text=_('Audiobook file'))

    def __str__(self):
        return self.audio_name

    def audiofile_name(self):
        return self.audio_file.url

    @mark_safe
    def audiofile(self):
        return f'<audio controls><source src="{self.audiofile_name()}" type="audio/mpeg"></audio>'

    # todo: test this method
    def delete(self, using=None, keep_parents=False):
        if self.audio_file.name != '':
            try:
                os.remove(os.path.join(settings.MEDIA_ROOT, self.audio_file.name))
            except FileNotFoundError:
                pass
            super(AudioBook, self).delete(using, keep_parents)

    class Meta:
        verbose_name_plural = "Audiobooks"
        ordering = ('audio_name',)


class BookAsArrayAudio(models.Model):
    """ maps audio to text"""
    book = models.ForeignKey(Organization,
                             on_delete=models.DO_NOTHING,
                             verbose_name="Book"
                             )

    audio = models.ForeignKey(AudioBook,
                              null=True,
                              blank=True,
                              on_delete=models.DO_NOTHING,
                              verbose_name="Audio",
                              help_text="Audio"
                              )

    chapter = models.IntegerField(default=0)

    verse = models.IntegerField(default=0)

    start = models.CharField(max_length=12,
                             default='00:00:00.000',
                             validators=[validate_time],
                             verbose_name="Start time",
                             help_text="Start time")

    end = models.CharField(max_length=12,
                           default='00:00:00.000',
                           validators=[validate_time],
                           verbose_name="End",
                           help_text="End time")

    start_ms = models.FloatField(default=0.000)

    end_ms = models.FloatField(default=0.000)

    def __str__(self):
        return self.book.book_title_en

    @mark_safe
    def start_format(self):
        return '{0:10.3f}'.format(self.start_ms)

    start_format.short_description = 'Start'

    @mark_safe
    def end_format(self):
        return '{0:10.3f}'.format(self.end_ms)

    end_format.short_description = 'End'

    def audi_file_name(self):
        return self.audio.audio_file.url

    @staticmethod
    def get_audio_list(book):
        """ get the audio list for a book"""
        distinct = {}
        for query in BookAsArrayAudio.objects.filter(book=book):
            if query.audio is None:
                continue
            distinct[query.audio.id] = query.audio.audio_file.name
        return distinct

    def get_previous(self, book, chapter, verse):
        """ get previous record """
        if verse - 1 > 0:
            return BookAsArrayAudio.objects.filter(book=book, chapter=chapter, verse=verse - 1).first()
        else:
            last_verse = VERSE_TABLE[self.book.book_title_en][chapter - 2]
            if chapter - 1 > 0:
                previous_chapter = chapter - 1
                return BookAsArrayAudio.objects.filter(book=book, chapter=previous_chapter, verse=last_verse).first()
        return self

    def save(self, *args, **kwargs):
        # fill in the start based on end of previous record
        if self.start is None and self.end != '00:00:00.000':
            previous = self.get_previous(self.book, self.chapter, self.verse)
            if previous != self:
                self.start = previous.end
                if self.audio is None and previous.audio is not None:
                    self.audio = previous.audio

        if self.start_ms == 0 and self.end_ms != 0:
            previous = self.get_previous(self.book, self.chapter, self.verse)
            if previous != self:
                self.start_ms = previous.end_ms

                if self.audio is None and previous.audio is not None:
                    self.audio = previous.audio

        # fill in the start_ms and end_ms based on start and end
        if self.start == '00:00:00.000' and self.end != '00:00:00.000':
            self.start_ms = convert_time_to_seconds(self.start)
            self.end_ms = convert_time_to_seconds(self.end)

        if self.start_ms != 0 and self.end_ms != 0:
            self.start = convert_seconds_to_time(self.start_ms)
            self.end = convert_seconds_to_time(self.end_ms)

        super(BookAsArrayAudio, self).save(*args, **kwargs)

    class Meta:
        app_label = 'karaites'
        ordering = ('book', 'chapter', 'verse', 'start')
        verbose_name_plural = _('Biblical books audio')


class Songs(models.Model):
    """ Liturgy Songs """

    song_title = models.CharField(max_length=100,
                                  verbose_name=_("Song Title"))

    song_file = models.FileField(upload_to='songs/',
                                 verbose_name=_("Song File"))

    def __str__(self):
        return self.song_title

    def to_json(self):
        return {'id': self.pk,
                'song_title': self.song_title,
                'song_file': self.song_file.url.replace('/media/songs/', ''),
                }

    @mark_safe
    def audi_song(self):
        return f'<audio controls><source src="{self.song_file.url}" type="audio/mpeg"></audio>'

    audi_song.short_description = 'Audio'

    @mark_safe
    def file_name(self):
        return self.song_file.url.replace('/media/songs/', '')

    file_name.short_description = 'File Name'

    def delete(self, using=None, keep_parents=False):

        if self.song_file.name != '':
            try:
                os.remove(os.path.join(settings.MEDIA_ROOT, self.song_file.name))
            except FileNotFoundError:
                pass
            super(Songs, self).delete(using, keep_parents)

    class Meta:
        verbose_name_plural = _('Songs')
        ordering = ('song_title',)


# class LiturgyDetails(models.Model):
#    """ Liturgy books have a new format easier to read and understand
#        also have a new format for the audio files
#        In time all Liturgy books now in KaraitesBookAsArray will
#        be moved to this model
#     """
#
#    occasion = models.CharField(max_length=100,
#                                null=True,
#                                blank=True,
#                                verbose_name=_("Occasion"),
#                                help_text=_("Occasion"))
#
#    hebrew_name = models.CharField(max_length=100,
#                                   verbose_name=_("Hebrew Name"),
#                                   help_text=_("Hebrew Name"))
#
#    english_name = models.CharField(max_length=100,
#                                    verbose_name=_("English Name"),
#                                    help_text=_("English Name"))
#
#    author = models.ForeignKey('Author',
#                               on_delete=models.CASCADE,
#                               null=True,
#                               blank=True,
#                               verbose_name=_("Author"))
#
#    # text_hebrew, text_english, text_transliteration, header, bold | italic| underline| bold_italic
#    intro = ArrayField(ArrayField(models.TextField()), default=list)
#
#    # text_hebrew, text_english, text_transliteration, header, bold | italic| underline| bold_italic
#    toc = ArrayField(ArrayField(models.TextField()), default=list)
#
#    book_language = models.CharField(max_length=8,
#                                     default='he',
#                                     choices=LANGUAGES,
#                                     verbose_name=_('Book language'))
#
#    display = models.CharField(default="1",
#                               verbose_name=_("Display"),
#                               max_length=1,
#                               help_text=_("1) Hebrew on Left. Transliteration on right. \
#                                   Each verse has its translation below it. "))
#
#    order = models.IntegerField(default=0,
#                                verbose_name=_("Order"),
#                                help_text=_("Order"))
#
#    def __str__(self):
#        return self.english_name
#
#    def to_json(self):
#        return {
#            'occasion': self.occasion,
#            'hebrew_name': self.hebrew_name,
#            'english_name': self.english_name,
#            'intro': self.intro,
#            'display': self.display,
#            'order': self.order,
#        }
#
#    def save(self, *args, **kwargs):
#        if self.order == 0:
#            self.order = LiturgyDetails.objects.all().count() * 1000
#        super(LiturgyDetails, self).save(*args, **kwargs)
#
#    class Meta:
#        verbose_name_plural = _('Liturgy')
#        ordering = ('english_name',)


# class LiturgyBook(models.Model):
#     """ Liturgy Books
#         contain the Book data audio time markers, highlight info
#         when playing the audio
#     """
#
#     book = models.ForeignKey(LiturgyDetails,
#                              on_delete=models.CASCADE,
#                              related_name='LiturgyBook')
#
#     song = models.ForeignKey(Songs,
#                              on_delete=models.CASCADE,
#                              related_name='LiturgySong')
#
#     # [[hebrew, transliteration, english], audio_start, audio_end, song_id, reciter, censored, line_number]
#     # these are grouped according to the song and xls file
#     book_text = ArrayField(ArrayField(models.TextField()), default=list)
#
#     line_number = models.IntegerField(default=0,
#                                       verbose_name=_("Line Number"),
#                                       help_text=_("Line Number"))
#
#     # comments for each verse
#
#     def __str__(self):
#         return self.book.english_name
#
#     @mark_safe
#     def show_book_data(self):
#         hebrew = self.book_text[0]
#         transliteration = self.book_text[1]
#         english = self.book_text[2]
#         # audio_start = self.book_text[3]
#         # audio_end = self.book_text[4]
#         # reciter = self.book_text[5]
#         # censored = self.book_text[6]
#         # line_number = self.book_text[7]
#
#         html = '<div style="display:flex">'
#         html += f'<span dir="rtl" style="width:50%;inline:block;margin:5px; text-align:right">{hebrew}</span>'
#         html += f'<span dir="ltr" style="width:50%;inline:block;margin:5px; text-align:left">{transliteration}</span>'
#         html += f'</div>'
#         html += f'<span dir="ltr" style="text-align:center">{english}</span>'
#
#         return html
#
#     show_book_data.short_description = 'Book Data'
#
#     @mark_safe
#     def show_line_data(self):
#         audio_start = self.book_text[3] if self.book_text[3] else '-'
#         audio_end = self.book_text[4] if self.book_text[4] else '-'
#         id = self.book_text[5] if self.book_text[5] else '-'
#         reciter = self.book_text[6] if self.book_text[6] else '-'
#         censored = self.book_text[7] if self.book_text[7] else '-'
#
#         if audio_start == '-' and audio_end == '-' and reciter == '-' and censored == '-':
#             return ''
#
#         html = '<table>'
#         html += '<th>Audio Start</th>'
#         html += '<th>Audio End</th>'
#         html += '<th>Id</th>'
#         html += '<th>Reciter</th>'
#         html += '<th>Censored</th>'
#         html += '<tr>'
#         html += f'<td>{audio_start}</td>'
#         html += f'<td>{audio_end}</td>'
#         html += f'<td>{id}</td>'
#         html += f'<td>{reciter}</td>'
#         html += f'<td>{censored}</td>'
#         html += f'<tr>'
#         html += '</table>'
#
#         return html
#
#     show_line_data.short_description = 'Line Data'
#
#     def to_json(self):
#
#         return {
#             'book_text': self.book_text,
#         }
#
#     @staticmethod
#     def get_book(book_name):
#         details = LiturgyDetails.objects.get(english_name=book_name).to_json()
#         songs = []
#         for song in Songs.objects.filter(LiturgySong__book__english_name=book_name):
#             songs.append(song.to_json())
#
#         book_data = []
#         for book in LiturgyBook.objects.filter(book__english_name=book_name):
#             book_data.append(book.to_json())
#
#         return {'details': details, 'songs': songs, 'book_data': book_data}
#
#     class Meta:
#         verbose_name_plural = _('Liturgy Books')
#         ordering = ('book__english_name', 'song__song_title', 'line_number')
#         unique_together = ('book', 'song', 'line_number')


class Method(models.Model):
    """ Methods to be used in pre-process and pro-process"""

    method_name = models.CharField(max_length=30,
                                   verbose_name=_("Method Name"))

    pre_process = models.BooleanField(default=False,
                                      verbose_name=_("Pre-process"))

    pro_process = models.BooleanField(default=False,
                                      verbose_name=_("Pro-process"))


def __str__(self):
    return self.method_name


class Meta:
    verbose_name_plural = _('Method')
    ordering = ('method_name',)


class Classification(models.Model):
    """ Books Classification """
    classification_name = models.CharField(max_length=50,
                                           unique=True,
                                           verbose_name=_("Classification Name"),
                                           help_text=_("Classification Name"))

    classification_name_he = models.CharField(max_length=50,
                                              default='',
                                              blank=True,
                                              verbose_name=_("Classification Name Hebrew"),
                                              help_text=_("Classification Name Hebrew"))

    order = models.IntegerField(default=0,
                                help_text=_('Order classification'))

    def __str__(self):
        return self.classification_name

    @mark_safe
    def classification_name_he_html(self):
        return f'<p dir="rtl">{self.classification_name_he}</p>'

    class Meta:
        verbose_name_plural = _('Classification')
        ordering = ('order', 'classification_name',)


class KaraitesBookDetails(models.Model):
    """  Karaites books, many of them are not in the bible """

    # many of the fields are to be removed when all books are moved to better format

    first_level = models.ForeignKey(FirstLevel,
                                    on_delete=models.DO_NOTHING,
                                    verbose_name=_('Law'))

    book_classification = models.ForeignKey(Classification,
                                            null=False,
                                            blank=False,
                                            on_delete=models.DO_NOTHING,
                                            verbose_name=_('Classification'))

    book_language = models.CharField(max_length=8,
                                     choices=LANGUAGES,
                                     verbose_name=_('Book language'))

    intro = models.BooleanField(default=False,
                                verbose_name=_('Book has Introduction'),
                                )

    toc = models.BooleanField(default=False,
                              verbose_name=_('Book has TOC'),
                              )

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
                                     blank=True,
                                     verbose_name=_('Title Hebrew'))

    book_title_unslug = models.CharField(max_length=100,
                                         editable=False,
                                         default='')

    introduction = models.TextField(default='',
                                    verbose_name=_('Introduction'),
                                    editable=False,
                                    help_text=_('This field is used to store the introduction of the book'))

    book_source = models.FileField(upload_to='books/',
                                   default='',
                                   blank=True,
                                   verbose_name=_('Book Source '),
                                   help_text=_('This field is used to store the source of the book'))

    book_source_intro = models.FileField(upload_to='intro/',
                                         default='',
                                         blank=True,
                                         verbose_name=_('Book Intro Source'),
                                         help_text=_(
                                             'This field is used to store the source of the book introduction'))

    book_toc_source = models.FileField(upload_to='toc/',
                                       default='',
                                       blank=True,
                                       verbose_name=_('Book TOC  Source'),
                                       help_text=_('This field is used to store the processed source of the book TOC'))
    # check if still need this field
    processed_book_source = models.FileField(upload_to='processed_source/',
                                             default='',
                                             blank=True,
                                             editable=False,
                                             verbose_name=_('Book processed Source'),
                                             help_text=_(
                                                 'This field is used to store the processed  source of the book'))

    processed_book_source_intro = models.FileField(upload_to='processed_intro/',
                                                   default='',
                                                   blank=True,
                                                   editable=False,
                                                   verbose_name=_('Book processed Intro Source'),
                                                   help_text=_(
                                                       'This field is used to store the processed source of the book introduction'))

    processed_book_toc_source = models.FileField(upload_to='processed_toc/',
                                                 default='',
                                                 blank=True,
                                                 editable=False,
                                                 verbose_name=_('Book processed TOC Source'),
                                                 help_text=_(
                                                     'This field is used to store the source of the processed book TOC'))

    table_book = models.BooleanField(default=False,
                                     verbose_name=_('Table Book'),
                                     help_text=_('This field is used to inform that book is a html table'))

    columns = models.IntegerField(default=0,
                                  verbose_name=_('Columns'),
                                  help_text=_('This field is used to inform the number of columns in the book'))

    columns_order = models.CharField(max_length=10,
                                     default='0,1',
                                     blank=True,
                                     verbose_name=_('Columns order'),
                                     help_text=_('This field is used to inform the order of columns in the book'))

    toc_columns = models.CharField(max_length=10,
                                   default='',
                                   blank=True,
                                   verbose_name=_('TOC Columns'),
                                   help_text=_('This field is used to inform the order '
                                               'of columns in the table of contents'))

    direction = models.CharField(max_length=3,
                                 default='rtl',
                                 choices=[('rtl', 'rtl'),
                                          ('ltr', 'ltr')],
                                 verbose_name=_('Text Direction'),
                                 help_text=_('This field is used to inform the direction of the text in the book'))

    remove_class = models.CharField(max_length=100,
                                    choices=[('', 'None'),
                                             ('MsoTableGrid', 'MsoTableGrid'),
                                             ],
                                    default='',
                                    blank=True,
                                    verbose_name=_('Remove class'),
                                    help_text=_('This field is used to inform the class to remove from the book'))

    css_class = models.CharField(max_length=100,
                                 choices=[
                                     ('', 'None'),
                                     ('simple', 'Simple'),
                                     ('simple-3-4', 'Simple 3 4'),
                                     ('invert-odd', 'Invert Odd'),
                                     ('special', 'Special'),
                                     ('special-1', 'Special 1'),
                                     ('sefer-extra', 'Sefer Extra'),
                                 ],
                                 default='',
                                 blank=True,
                                 verbose_name=_('CSS class'),
                                 help_text=_('This field is used to inform the class to add to the book'))

    remove_tags = models.CharField(max_length=100,
                                   default='',
                                   blank=True,
                                   verbose_name=_('Remove tags'),
                                   help_text=_('This field is used to inform the tags to remove from the book'))

    # book has more than on table
    multi_tables = models.BooleanField(default=False,
                                       verbose_name=_('Multi tables'),
                                       help_text=_('This field is used to inform'
                                                   ' that book has more than one table'))

    # book may have one or more songs
    songs = models.ManyToManyField(Songs,
                                   blank=True)

    # buy link
    buy_link = models.CharField(max_length=255,
                                default='',
                                blank=True,
                                verbose_name=_('Buy link'),
                                help_text='This field is used to inform the buy link of the book')

    # search index hebrew, english, transliteration
    index_lang = models.BooleanField(default=True,
                                     verbose_name=_('Index transliteration'))

    method = models.ManyToManyField(Method,
                                    blank=True,
                                    verbose_name=_('Methods'),
                                    help_text=_('This field is used to inform the'
                                                ' pre/pro process methods to apply on book'))

    skip_process = models.BooleanField(default=False,
                                       verbose_name=_('Skip process'),
                                       help_text=_('This field is used to inform'
                                                   ' that this book should not be processed'))

    user = models.ForeignKey(User,
                             blank=True,
                             null=True,
                             default=None,
                             on_delete=models.DO_NOTHING,
                             verbose_name=_('User'),
                             help_text=_('This field is used to inform the user'
                                         ' who added the book'))

    published = models.BooleanField(default=False,
                                    verbose_name=_('Published'),
                                    help_text=_('This field is used to inform if the books is published '
                                                'this way is possible to upload a book and process it later'))

    cron_schedule = models.BooleanField(default=False,
                                        editable=False,
                                        help_text='This field is used to inform if the books is scheduled to be processed',
                                        verbose_name='Cron schedule')

    # book generated using Excel, a better and more accurate book
    better_book = models.BooleanField(default=False,

                                      verbose_name=_('Better book'),
                                      help_text=_('This field is used to inform if the books is better book'))

    occasion = models.CharField(max_length=50,
                                null=True,
                                blank=True,
                                verbose_name=_("Occasion"),
                                help_text=_("Occasion"))

    pattern = models.CharField(max_length=50,
                               null=True,
                               blank=True,
                               verbose_name=_("Pattern"),
                               help_text=_("Pattern"))

    # this field is used to inform if the book is a better book
    # text_hebrew, text_english, text_transliteration, header, bold | italic| underline| bold_italic
    better_intro = ArrayField(ArrayField(models.TextField()), default=list, blank=True)

    # this field is used to inform if the book is a better book
    # text_hebrew, text_english, text_transliteration, header, bold | italic| underline| bold_italic
    better_toc = ArrayField(ArrayField(models.TextField()), default=list, blank=True)

    display = models.CharField(default="1",
                               verbose_name=_("Display"),
                               max_length=1,
                               help_text=_("1) Hebrew on Left. Transliteration on right. \
                                      Each verse has its translation below it. "))

    order = models.IntegerField(default=0,
                                verbose_name=_("Order"),
                                help_text=_("Order"))

    kedushot_order = models.CharField(max_length=3,
                                      default='',
                                      null=True,
                                      blank=True,
                                      verbose_name=_("Kedushot order"),
                                      help_text=_("Kedushot order"))
    kedushot_main_title = models.CharField(max_length=100,
                                           default='',
                                           null=True,
                                           blank=True,
                                           verbose_name=_("Kedushot Main Title"),
                                           help_text=_("Kedushot Main Title"))
    kedushot_title = models.CharField(max_length=100,
                                      default='',
                                      null=True,
                                      blank=True,
                                      verbose_name=_("Kedushot title"),
                                      help_text=_("Kedushot title"))

    kedushot_sub_title = models.CharField(max_length=100,
                                          default='',
                                          null=True,
                                          blank=True,
                                          verbose_name=_("Kedushot sub title"),
                                          help_text=_("Kedushot sub title"))

    kedushot_expanded = models.BooleanField(default=False,
                                            verbose_name=_("Kedushot expanded"),
                                            help_text=_("Kedushot expanded"))

    kedushot_left = models.CharField(max_length=100,
                                     default='',
                                     null=True,
                                     blank=True,
                                     verbose_name=_("Kedushot left"),
                                     help_text=_("Kedushot left"))

    def __str__(self):
        return self.book_title_en

    @mark_safe
    def intro_to_html(self):
        return self.introduction

    @mark_safe
    def song_list(self):
        html = ''
        for song in self.songs.all():
            html += f'<p>{song.song_title}</p>'
        return html

    def get_language(self):
        """ process_intro_he_en recognizes language intro and toc
            examples : he,en,in | he,in,toc | en,he,in | he | en ...
        """
        lang = self.book_language
        lang += ',in' if self.intro else ''
        lang += ',toc' if self.toc else ''
        return lang

    def get_song_list(self):
        return [song.to_json() for song in self.songs.all()]

    @staticmethod
    def to_dic(details, toc):
        return {
            'book_id': details.id,
            'book_first_level': details.first_level.first_level,
            'book_language': details.get_language(),
            'book_classification': details.book_classification.classification_name,
            'author': details.author.name if details.author else '',
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
            'songs_list': details.get_song_list(),
            'buy_link': details.buy_link,
            'index_lag': details.index_lang,
            'better_book': details.better_book,
            'occasion': details.occasion,
            'display': details.display,
            'kedushot_main_title': details.kedushot_main_title,
            'kedushot_title': details.kedushot_title,
            'kedushot_sub_title': details.kedushot_sub_title,
            'kedushot_expanded': details.kedushot_expanded,
            'kedushot_left': details.kedushot_left,
        }

    @staticmethod
    def get_all_books_by_first_level(level, classification=False):
       
        if not classification:
            book_details = KaraitesBookDetails.objects.filter(first_level__url=level,
                                                              published=True).order_by('book_title_en')
        else:
            if level == 'Liturgy':

                book_details = KaraitesBookDetails.objects.filter(
                    first_level__url=level,
                    published=True).order_by('book_classification')
              
            else:
                book_details = KaraitesBookDetails.objects.filter(
                    first_level__url=level,
                    published=True).order_by('order')

        data = []
        for details in book_details:
            data.append(details.to_dic(details, []))

        return data

    @staticmethod
    def to_json(book_title_unslug):
        details = KaraitesBookDetails.objects.get(book_title_unslug__startswith=book_title_unslug,
                                                  published=True)
        toc = TableOfContents.objects.filter(karaite_book=details)
        return details.to_dic(details, toc)

    @mark_safe
    def processed(self):
        if self.cron_schedule:
            return '<span class="badge badge-danger">To be processed</span>'
        return '<span class="badge badge-success">Processed</span>'

    def save(self, *args, **kwargs):
        self.book_title_unslug = self.book_title_en
        # if cron_schedule is passed as a kwarg, then set it to the value of cron_schedule
        # else True
        self.cron_schedule = kwargs.get('cron_schedule', True)
        kwargs = {}
        super(KaraitesBookDetails, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        source_files = [self.book_source.name,
                        self.book_source_intro.name,
                        self.book_toc_source.name,
                        self.processed_book_source.name,
                        self.processed_book_source_intro.name,
                        self.processed_book_toc_source.name]

        for source in source_files:
            if source == '':
                continue
            try:
                os.remove(os.path.join(settings.MEDIA_ROOT, source))
            except FileNotFoundError:
                pass
        # delete record
        super(KaraitesBookDetails, self).delete(using, keep_parents)

    class Meta:
        verbose_name_plural = 'Karaites book details'
        ordering = ('book_title_en', 'author')


class DetailsProxy(KaraitesBookDetails):
    class Meta:
        proxy = True
        verbose_name_plural = 'Karaites book details no Html'


class BooksFootNotes(models.Model):
    """ deprecated Book footnotes """

    book = models.ForeignKey(KaraitesBookDetails,
                             on_delete=models.CASCADE,
                             verbose_name=_('Book'))

    footnote_ref = models.CharField(max_length=20,
                                    default='',
                                    verbose_name=_('Footnote ref.'))

    footnote_number = models.IntegerField(default=0,
                                          verbose_name=_('Footnote number'))

    footnote = models.TextField(default='',
                                verbose_name=_('Footnotes'))

    language = models.CharField(max_length=8,
                                choices=LANGUAGES,
                                verbose_name=_('Book language'))

    def __str__(self):
        return '{} - {}'.format(self.book, self.footnote_number)

    def to_json(self):
        return {
            'footnote_ref': self.footnote_ref,
            'footnote': self.footnote,
        }

    @staticmethod
    def all_foot_notes(book_id):

        try:
            foot_notes = [f.to_json() for f in BooksFootNotes.objects.filter(book_id=book_id)]
        except BooksFootNotes.DoesNotExist:
            foot_notes = []

        return foot_notes

    class Meta:
        verbose_name_plural = 'Books footnotes'
        ordering = ('book', 'footnote_number')


LIMIT = 100
FILLER = ['', '', '', '', '', '', '', '', 0, '', 0, 1, 0, '0', '0', '0', '0', '0', '0', '0']


class KaraitesBookAsArray(models.Model):
    """ Better books """
    book = models.ForeignKey(KaraitesBookDetails,
                             on_delete=models.CASCADE,
                             verbose_name=_('Karaite book details')
                             )

    # this should go away when all books are better books
    ref_chapter = models.CharField(max_length=260,
                                   default='',
                                   verbose_name=_('Reference/Chapter'))

    # this should go away when all books are better books
    paragraph_number = models.IntegerField(default=0)

    # although the field is called song, it is used for the audiobook
    song = models.ForeignKey(Songs,
                             null=True,
                             blank=True,
                             on_delete=models.CASCADE,
                             related_name='audiobook')

    # book details better_book is false
    # [paragraph English, 0,  paragraph Hebrew]

    # book details better_book is true
    # [hebrew, transliteration, english, audio_start, audio_end, song_id, reciter, censored, line_number, break, song end, comments, pattern, reserved, reserved, reserved, reserved, reserved    ]
    # these are grouped according to the song and xls file
    #  filler = ['', '', '', '', '', '', '', '', 0, '', 0, 1, 0, '0', '0', '0', '0', '0', '0' ,'0']
    book_text = ArrayField(ArrayField(models.TextField()),
                           default=list,
                           null=True,
                           blank=True)

    # this should replace paragraph_number when book details better_book is true
    line_number = models.IntegerField(default=0,
                                      verbose_name=_("Line Number"),
                                      help_text=_("Line Number"))

    # [[footnote English ], [footnote Hebrew],[footnote arabic]
    # [footnote number, footnote text]
    foot_notes = ArrayField(models.TextField(),
                            default=list,
                            null=True,
                            blank=True)

    def __str__(self):
        return f'{self.book.book_title_en}  -   {self.book.book_title_he}'

    @staticmethod
    def to_list(book, paragraph_number, first):
        # chapters don't exist, so we read paragraphs

        if first == 0:
            query = KaraitesBookAsArray.objects.filter(book=book, paragraph_number__gte=0,
                                                       paragraph_number__lte=paragraph_number)
        else:
            query = KaraitesBookAsArray.objects.filter(book=book, paragraph_number__gt=paragraph_number)[0:LIMIT]

        result = []
        for book in query:
            print(book.book_text)
            result.append(book.book_text)
        return result

    @mark_safe
    def text_en(self):
        html = '<table><tbody><tr>'
        html += f'<td class="en-verse" dir="ltr">{self.book_text[0]}</td>'
        html += '</tr></tbody></table>'
        return html

    text_en.short_description = "English"

    @mark_safe
    def text_he(self):
        html = '<table><tbody><tr>'
        html += f'<td class="he-verse">{self.book_text[2]}</td>'
        html += '</tr></tbody></table>'
        return html

    text_he.short_description = "Hebrew"

    @mark_safe
    def foot_notes_admin(self):
        html = ''
        for foot_note in self.foot_notes:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    foot_notes_admin.short_description = 'Foot notes'

    # for better books
    @mark_safe
    def show_book_data(self):
        hebrew = self.book_text[0]
        transliteration = self.book_text[1]
        english = self.book_text[2]
        # audio_start = self.book_text[3]
        # audio_end = self.book_text[4]
        # reciter = self.book_text[5]
        # censored = self.book_text[6]
        # line_number = self.book_text[7]

        html = '<div style="display:flex">'
        html += f'<span dir="rtl" style="width:50%;inline:block;margin:5px; text-align:right">{hebrew}</span>'
        html += f'<span dir="ltr" style="width:50%;inline:block;margin:5px; text-align:left">{transliteration}</span>'
        html += f'</div>'
        html += f'<span dir="ltr" style="text-align:center">{english}</span>'

        return html

    show_book_data.short_description = 'Book Data'

    @mark_safe
    def show_line_data(self):
        if not self.book.better_book:
            return ''

        audio_start = self.book_text[3] if self.book_text[3] else '-'
        audio_end = self.book_text[4] if self.book_text[4] else '-'
        id = self.book_text[5] if self.book_text[5] else '-'
        reciter = self.book_text[6] if self.book_text[6] else '-'
        censored = self.book_text[7] if self.book_text[7] else '-'

        if audio_start == '-' and audio_end == '-' and reciter == '-' and censored == '-':
            return ''

        html = '<table>'
        html += '<th>Audio Start</th>'
        html += '<th>Audio End</th>'
        html += '<th>Id</th>'
        html += '<th>Reciter</th>'
        html += '<th>Censored</th>'
        html += '<tr>'
        html += f'<td>{audio_start}</td>'
        html += f'<td>{audio_end}</td>'
        html += f'<td>{id}</td>'
        html += f'<td>{reciter}</td>'
        html += f'<td>{censored}</td>'
        html += f'<tr>'
        html += '</table>'

        return html

    show_line_data.short_description = 'Line Data'

    def to_json(self):
        return {
            'book_text': self.book_text,
        }

    # better books
    @staticmethod
    def get_book(book_name):

        query_book_details = KaraitesBookDetails.objects.get(book_title_en=slug_back(book_name), published=True)
        print(query_book_details)
        query_book = KaraitesBookAsArray.objects.filter(book=query_book_details).order_by('book', 'line_number')
        print(query_book)
        songs = []
        for song in query_book_details.songs.all():
            songs.append(song.to_json())

        book_data = []
        for book in query_book:
            book_data.append(book.book_text)

        return {'details': KaraitesBookDetails.to_dic(query_book_details, []),
                'songs': songs,
                'book_data': book_data}

    class Meta:
        ordering = ('paragraph_number', 'book', 'ref_chapter')
        verbose_name_plural = 'Karaites book text as array'


class KaraitesBetterBooksProxy(KaraitesBookAsArray):
    class Meta:
        proxy = True
        verbose_name_plural = 'Karaites better books'
        ordering = ('book', 'line_number')


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
                                      verbose_name=_('Karaites book'),
                                      help_text=_('Karaites book'))

    paragraph_number = models.IntegerField(default=0,
                                           verbose_name=_('Karaites paragraph that references Bible book'),
                                           help_text=_('Karaites paragraph that references Bible book'))

    bible_ref_en = models.CharField(max_length=40,
                                    default='',
                                    verbose_name=_('ref. English'),
                                    help_text=_('ref. English'))

    bible_ref_he = models.CharField(max_length=40,
                                    default='',
                                    verbose_name=_('ref. Hebrew'),
                                    help_text=_('ref. Hebrew'))

    paragraph_text = ArrayField(ArrayField(models.TextField()),
                                default=list,
                                verbose_name=_('Paragraph text Hebrew/English'),
                                help_text=_('Paragraph text Hebrew/English'))

    foot_notes = ArrayField(models.TextField(),
                            default=list,
                            null=True,
                            blank=True,
                            verbose_name=_('Foot notes Hebrew/English'),
                            help_text=_('Foot notes Hebrew/English'))

    error = models.CharField(max_length=2,
                             choices=REF_ERROR_CODE,
                             default='',
                             verbose_name=_('error'))

    def __str__(self):
        return f'{self.karaites_book.book_title_en} on paragraph {self.paragraph_number} references to: {self.bible_ref_en}'

    @mark_safe
    def paragraph_admin_he(self):
        # text[2] is hebrew, text[0] is english
        html = '<table><tbody><tr>'
        html += f'<td class="he-verse">{self.paragraph_text[2]}</td>'

        html += '</tr></tbody></table>'
        return html

    paragraph_admin_he.short_description = 'Hebrew'

    @mark_safe
    def paragraph_admin_en(self):
        # text[2] is hebrew, text[0] is english
        html = '<table><tbody><tr>'
        html += f'<td class="en-verse" dir="ltr">{self.paragraph_text[0]}</td>'
        html += '</tr></tbody></table>'
        return html

    paragraph_admin_en.short_description = 'English'

    @mark_safe
    def foot_notes_admin(self):
        html = ''
        for foot_note in self.foot_notes:
            html += f'<p dir="RTL">{foot_note}</p>'
        return html

    @mark_safe
    def law(self):
        return self.karaites_book.first_level.first_level

    def to_json(self):
        return {'book_name_en': self.karaites_book.book_title_en,
                'book_name_he': self.karaites_book.book_title_he,
                'author': self.karaites_book.author.name,
                'language': self.karaites_book.book_language,
                'paragraph_number': self.paragraph_number,
                'paragraph_html': self.paragraph_text,
                'bible_ref_he': self.bible_ref_he,
                'bible_ref_en': self.bible_ref_en,
                'book_classification': self.karaites_book.book_classification.classification_name,
                'book_first_level': self.karaites_book.first_level.first_level,
                'book_first_level_he': self.karaites_book.first_level.first_level_he,
                }

    @staticmethod
    def to_list(bible_ref_en, law=None):
        ro = References.objects

        if law is None:
            query = ro.filter(bible_ref_en=bible_ref_en).order_by('karaites_book__first_level',
                                                                  'karaites_book__book_classification',
                                                                  'karaites_book__book_language')
        else:

            query = ro.filter(bible_ref_en=bible_ref_en,
                              karaites_book__first_level__first_level=law).order_by('karaites_book__first_level',
                                                                                    'karaites_book__book_classification',
                                                                                    'karaites_book__book_language')
        result = []
        for ref in query:
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
    """ Full-text search for books in English """
    path = models.CharField(max_length=50, default='')

    reference_en = models.CharField(max_length=100, default='')

    text_en = models.TextField(default='')

    text_en_search = SearchVectorField(null=True)

    def __str__(self):
        return self.reference_en

    def to_dict(self):
        """ Make a dictionary of the object """
        return {'reference_en': self.reference_en,
                'text_en': self.text_en,
                }

    class Meta:
        verbose_name_plural = 'Full text search English'
        indexes = [GinIndex(fields=["text_en_search"])]


class FullTextSearchHebrew(models.Model):
    """ Full-text search for books in Hebrew """
    path = models.CharField(max_length=50, default='')

    reference_en = models.CharField(max_length=100,
                                    db_index=True,
                                    default='')

    reference_he = models.CharField(max_length=100,
                                    db_index=True,
                                    default='')

    text_he = models.TextField(default='')

    def __str__(self):
        return f'{self.path}  {self.reference_en}'

    def to_dict(self):
        """ Make a dictionary of the object """
        return {'reference_he': self.reference_he,
                'text_he': self.text_he,
                }

    class Meta:
        verbose_name_plural = 'Full text search Hebrew'


class InvertedIndex(models.Model):
    """ List of unique Hebrew words, inverted index"""

    # word no nikud/cantilation
    word = models.CharField(max_length=40,
                            db_index=True,
                            verbose_name=_("Hebrew word"))

    # list of words with nikud and/or cantilation
    word_as_in_text = ArrayField(models.CharField(max_length=40,
                                                  default=''),
                                 default=list,
                                 null=True,
                                 blank=True,
                                 verbose_name=_("Word as in text"))

    # total times that word appears in all documents
    count = models.IntegerField(default=0,
                                verbose_name=_('Count in all documents'))

    # [id of documents that contain that word]
    documents = ArrayField(models.IntegerField(default=0),
                           default=list,
                           null=True,
                           blank=True,
                           verbose_name=_('List of documents'))

    count_by_document = ArrayField(models.IntegerField(default=0),
                                   default=list,
                                   null=True,
                                   blank=True,
                                   verbose_name=_('Count by document'))

    rank = models.FloatField(default=0,
                             db_index=True,
                             verbose_name=_('Rank'))

    def __str__(self):
        return self.word

    class Meta:
        verbose_name_plural = _('Inverted index')
        ordering = ('-rank',)


class EnglishWord(models.Model):
    word = models.CharField(max_length=40,
                            db_index=True,
                            verbose_name=_("English word"))

    word_count = models.IntegerField(default=1,
                                     verbose_name=_('Word Count in all documents'))

    def __str__(self):
        return self.word

    class Meta:
        verbose_name_plural = _('English words')
        ordering = ('word',)


class MisspelledWord(models.Model):
    misspelled_word = models.CharField(max_length=40,
                                       db_index=True,
                                       verbose_name=_("Misspelled word"))

    correct_word = models.CharField(max_length=100,
                                    db_index=True,
                                    verbose_name=_("Correct word"))

    def __str__(self):
        return self.misspelled_word

    class Meta:
        verbose_name_plural = _('Misspelled words')
        ordering = ('misspelled_word',)


class MenuItems(models.Model):
    """Menu Items"""
    menu_item = models.CharField(max_length=100,
                                 default='',
                                 verbose_name=_('Menu Item'))
    complement = models.CharField(max_length=100,
                                  default='',
                                  verbose_name=_('Complement'))
    order = models.IntegerField(default=0,
                                verbose_name=_('Order'))

    def __str__(self):
        return self.menu_item

    class Meta:
        verbose_name_plural = _('Menu Items')
        ordering = ('order',)


class Kedushot(models.Model):
    """Kedushot and Piyyutim La-Parashiyyot"""
    menu_title_left = models.CharField(max_length=100,
                                       null=True,
                                       blank=True,
                                       default='',
                                       verbose_name=_('Menu Title Left'))

    menu_title_right = models.CharField(max_length=100,
                                        null=True,
                                        blank=True,
                                        default='',
                                        verbose_name=_('Menu Title Right'))

    belongs_to = models.CharField(max_length=100,
                                  null=True,
                                  blank=True,
                                  editable=False,
                                  default='',
                                  verbose_name=_('Belongs to'))

    menu_items = models.ManyToManyField(MenuItems,
                                        related_name='kedushot_menu_items',
                                        verbose_name=_('Menu Items'))

    order = models.IntegerField(default=0,
                                verbose_name=_('Order'))

    def __str__(self):
        return self.menu_title_left

    class Meta:
        verbose_name_plural = _('Kedushot')
        ordering = ('order',)
