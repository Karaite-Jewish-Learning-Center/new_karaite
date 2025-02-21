from django.contrib import admin
from .models import (FirstLevel,
                     SecondLevel,
                     Organization,
                     Author,
                     BookAsArray,
                     Parsha,
                     AudioBook,
                     BookAsArrayAudio,
                     BooksFootNotes,
                     Songs,
                     Classification,
                     KaraitesBookDetails,
                     DetailsProxy,
                     KaraitesBookAsArray,
                     KaraitesBetterBooksProxy,
                     TableOfContents,
                     References,
                     FullTextSearch,
                     FullTextSearchHebrew,
                     InvertedIndex,
                     MenuItems,
                     Kedushot)

from django.conf import settings

STATIC = settings.STATIC_URL


class KAdmin(admin.ModelAdmin):
    save_on_top = True

    class Media:
        css = {
            'all': (f'{STATIC}css/admin.css',
                    f'{STATIC}css/tooltip.css',)
        }
        js = (f'{STATIC}js/toggleFilterPanel.js',)


# actions
@admin.action(description='Change selected to default values.')
def change_to_default(_, __, queryset):
    queryset.update(audio=None, start='00:00:00.000', end='00:00:00.000', start_ms=0, end_ms=0)


class FirstLevelAdmin(KAdmin):
    list_display = ('first_level', 'first_level_he_html',
                    'break_on_classification', 'url', 'order')
    list_display_links = ('first_level',)
    list_editable = ('order',)


admin.site.register(FirstLevel, FirstLevelAdmin)


class SecondLevelAdmin(KAdmin):
    list_display = ('second_level', 'second_level_he_html', 'order')
    list_display_links = ('second_level',)
    list_editable = ('order',)


admin.site.register(SecondLevel, SecondLevelAdmin)


class OrganizationAdmin(KAdmin):
    list_display = ('first_level', 'second_level',
                    'book_title_en', 'summary_en',
                    'book_title_he', 'summary_he',
                    'chapter_show', 'verses', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)


admin.site.register(Organization, OrganizationAdmin)


class AuthorAdmin(KAdmin):
    list_display = ('name', 'name_he', 'comments_count_en',
                    'comments_count_he', 'history')
    search_fields = ('name',)
    list_filter = ('name',)


admin.site.register(Author, AuthorAdmin)


class BookAsArrayAdmin(KAdmin):
    list_per_page = 10
    list_display = ('book', 'chapter', 'text')
    list_filter = ('book', 'chapter')
    search_fields = ('book__book_title_en', 'chapter')


admin.site.register(BookAsArray, BookAsArrayAdmin)


class ParshaAdmin(KAdmin):
    list_display = ('book', 'order', 'parsha_en', 'parsha_he', 'parsha_portion', 'readings')
    list_editable = ('order',)


admin.site.register(Parsha, ParshaAdmin)


class AudioBookAdmin(KAdmin):
    search_fields = ('audio_name',)
    list_display = ('audio_name', 'audiofile')


admin.site.register(AudioBook, AudioBookAdmin)


@admin.action(permissions=['change'])
class BookAsArrayAudioAdmin(KAdmin):
    save_on_top = True
    list_per_page = 15
    list_display = ('book', 'audio', 'chapter', 'verse', 'start', 'end', 'start_ms', 'end_ms')
    list_editable = ('audio', 'start', 'end', 'start_ms', 'end_ms')
    search_fields = ('book__book_title_en',)
    list_filter = ('book__book_title_en',)
    actions = [change_to_default]

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(BookAsArrayAudio, BookAsArrayAudioAdmin)


class BookFootNotesAdmin(KAdmin):
    list_display = ('book', 'language', 'footnote_ref', 'footnote')
    search_fields = ('book', 'footnote_ref')
    list_filter = ('book',)


admin.site.register(BooksFootNotes, BookFootNotesAdmin)


class SongsAdmin(KAdmin):
    list_display = ('song_title', 'audi_song')
    search_fields = ('song_title',)
    actions = ['delete_selected']

    def delete_selected(self, request, queryset):
        for obj in queryset:
            obj.delete()

        if queryset.count() == 1:
            message = "1 song was deleted"
        else:
            message = "%s songs were deleted" % queryset.count()
        self.message_user(request, "%s successfully deleted." % message)

    delete_selected.short_description = "Delete selected songs"


admin.site.register(Songs, SongsAdmin)


# class LiturgyDetailsAdmin(KAdmin):
#     list_display = ('occasion', 'hebrew_name', 'english_name', 'order', 'intro')
#     list_editable = ('order',)
#     search_fields = ('occasion', 'hebrew_name', 'english_name')
#
#
# admin.site.register(LiturgyDetails, LiturgyDetailsAdmin)


# class LiturgyBookAdmin(KAdmin):
#     list_display = ('book', 'song', 'line_number', 'show_line_data', 'show_book_data')
#     list_filter = ('book', 'song')
#     search_fields = ('book', 'song')
#
#
# admin.site.register(LiturgyBook, LiturgyBookAdmin)


class ClassificationAdmin(KAdmin):
    list_display = ('classification_name',
                    'classification_name_he_html',
                    'order')
    list_editable = ('order',)


admin.site.register(Classification, ClassificationAdmin)


class KaraitesBookDetailsAdmin(KAdmin):
    save_on_top = True
    list_editable = ('published', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_display = ('user',
                    'processed',
                    'order',
                    'published',
                    'book_title_en',
                    'book_title_he',
                    'author',
                    'first_level',
                    'book_classification',
                    'book_language',
                    'song_list',
                    'table_book',
                    'multi_tables',
                    'columns',
                    'columns_order',
                    'toc_columns',
                    'direction',
                    'remove_class',
                    'remove_tags',
                    'css_class',
                    'buy_link',
                    'index_lang',
                    'intro_to_html',
                    'better_book')

    list_filter = ('published', 'better_book', 'first_level',
                   'book_language', 'book_classification', 'book_title_en')

    actions = ['delete_selected', 'publish_selected']

    def delete_selected(self, request, queryset):
        for obj in queryset:
            obj.delete()

        if queryset.count() == 1:
            message = "1 Karaites book detail "
        else:
            message = "%s Karaites book details " % queryset.count()
        self.message_user(request, "%s successfully deleted." % message)

    delete_selected.short_description = "Delete selected Karaites book details"

    def publish_selected(self, request, queryset):
        for obj in queryset:
            obj.published = True
            obj.save()

        if queryset.count() == 1:
            message = "1 Karaites book detail published"
        else:
            message = "%s Karaites book details published" % queryset.count()
        self.message_user(request, message)

    publish_selected.short_description = "Publish selected Karaites book details"


admin.site.register(KaraitesBookDetails, KaraitesBookDetailsAdmin)


class DetailsProxyAdmin(KAdmin):
    search_fields = ('book_title_en', 'book_title_he')
    list_display = ('user',
                    'processed',
                    'book_title_en',
                    'book_title_he',
                    'order',
                    'first_level',
                    'book_classification',
                    'author',
                    'book_language',
                    'song_list',
                    'table_book',
                    'multi_tables',
                    'columns',
                    'columns_order',
                    'toc_columns',
                    'direction',
                    'remove_class',
                    'remove_tags',
                    'css_class',
                    'buy_link',
                    'index_lang',
                    'published')

    list_editable = ('order',)

    list_filter = ('first_level', 'book_language', 'book_classification', 'book_title_en')

    # # don't allow changes on a proxy model, is just here to simplify data visualization
    # @staticmethod
    # def has_add_permission(request, obj=None):
    #     return False
    #
    # @staticmethod
    # def has_change_permission(request, obj=None, **kwargs):
    #     return False
    #
    # @staticmethod
    # def has_delete_permission(request, obj=None, **kwargs):
    #     return False


admin.site.register(DetailsProxy, DetailsProxyAdmin)


class KaraitesBookTextAsArrayAdmin(KAdmin):
    list_display = ('book', 'ref_chapter', 'paragraph_number',
                    'text_he', 'text_en', 'foot_notes_admin')

    list_filter = ('book__first_level', 'book__book_language',
                   'book__book_classification', 'book')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(book__better_book=False)


admin.site.register(KaraitesBookAsArray, KaraitesBookTextAsArrayAdmin)


class BetterBookFilter(admin.SimpleListFilter):
    title = 'book'
    parameter_name = 'book'

    def lookups(self, request, model_admin):
        better_books = KaraitesBookDetails.objects.filter(better_book=True)
        return [(book.id, book.book_title_en) for book in better_books]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(book__id=self.value())


class KaraitesBetterBooksAdmin(KAdmin):
    list_display = ('book', 'song', 'book_text', 'line_number', 'show_line_data', 'show_book_data')
    list_filter = (BetterBookFilter,)
    search_fields = ('book', 'song')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(book__better_book=True)


admin.site.register(KaraitesBetterBooksProxy, KaraitesBetterBooksAdmin)


class TableOfContentsAdmin(KAdmin):
    list_display = ('karaite_book', 'admin_subject', 'start_paragraph')

    list_filter = ('karaite_book',)


admin.site.register(TableOfContents, TableOfContentsAdmin)


class ReferencesAdmin(KAdmin):
    list_display = ('karaites_book', 'law', 'paragraph_number',
                    'paragraph_admin_he', 'paragraph_admin_en',
                    'foot_notes_admin', 'error', 'bible_ref_en',
                    'bible_ref_he')

    search_fields = ('bible_ref_en',)
    list_filter = ('karaites_book',
                   'karaites_book__first_level',
                   'karaites_book__book_classification',
                   'error')


admin.site.register(References, ReferencesAdmin)


class FullTextSearchAdmin(KAdmin):
    list_filter = ('path',)
    search_fields = ('reference_en', 'path')
    list_display = ('path', 'reference_en', 'text_en', 'text_en_search')


admin.site.register(FullTextSearch, FullTextSearchAdmin)


class FullTextSearchHebrewAdmin(KAdmin):
    list_filter = ('path',)
    search_fields = ('reference_en', 'reference_en', 'path')
    list_display = ('path', 'reference_en', 'reference_he', 'text_he',)


admin.site.register(FullTextSearchHebrew, FullTextSearchHebrewAdmin)


class InvertedIndexAdmin(KAdmin):
    search_fields = ('word',)
    list_display = ('word', 'word_as_in_text', 'count', 'documents', 'count_by_document', 'rank')


admin.site.register(InvertedIndex, InvertedIndexAdmin)


class MenuItemsAdmin(KAdmin):
    list_display = ('menu_item', 'complement', 'order')
    list_editable = ('order',)


admin.site.register(MenuItems, MenuItemsAdmin)


class KedushotAdmin(KAdmin):
    list_display = ('menu_title_left', 'menu_title_right', 'order', 'belongs_to')
    list_editable = ('order',)


admin.site.register(Kedushot, KedushotAdmin)
