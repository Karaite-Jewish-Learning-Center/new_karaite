from django.contrib import admin
from .models import (Organization,
                     Author,
                     Comment,
                     CommentTmp,
                     OtherBooks,
                     BookAsArray,
                     KaraitesBookDetails,
                     KaraitesBookAsArray,
                     TableOfContents,
                     References,
                     FullTextSearch)

from .admin_forms import AdminCommentForm
from django.conf import settings

STATIC = settings.STATIC_URL


class KAdmin(admin.ModelAdmin):
    save_on_top = True

    class Media:
        css = {
            'all': (f'../{STATIC}/css/admin.css',
                    f'../{STATIC}/css/tooltip.css',)
        }
        js = (f'../{STATIC}/js/toggleFilterPanel.js',)


class OrganizationAdmin(KAdmin):
    list_display = ('first_level', 'second_level',
                    'book_title_en', 'summary_en',
                    'book_title_he', 'summary_he',
                    'chapter_show', 'verses', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)


admin.site.register(Organization, OrganizationAdmin)


class OtherBooksAdmin(KAdmin):
    list_display = ('book_title_en', 'book_title_he', 'author', 'classification')
    search_fields = ('book_title_en', 'book_title_he', 'author')
    list_filter = ('classification',)


admin.site.register(OtherBooks, OtherBooksAdmin)


class AuthorAdmin(KAdmin):
    list_display = ('name', 'name_he', 'comments_count_en',
                    'comments_count_he', 'history')
    search_fields = ('name',)
    list_filter = ('name',)


admin.site.register(Author, AuthorAdmin)


class CommentAdmin(KAdmin):
    form = AdminCommentForm
    list_display = ('book', 'chapter', 'verse', 'english',
                    'foot_note_en_admin', 'hebrew',
                    'foot_note_he_admin', 'comment_author',
                    'source_book')

    list_filter = ('comment_author', 'book', 'chapter')
    actions = ['delete_model']

    def get_actions(self, request):
        """ remove default delete"""
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def delete_model(self, request, obj):
        """need to call model delete to keep comment_count up to date"""
        for instance in obj.all():
            Comment.objects.get(pk=instance.pk).delete()

    delete_model.short_description = 'Delete selected'


admin.site.register(Comment, CommentAdmin)


class CommentTmpAdmin(CommentAdmin):
    def get_actions(self, request):
        """ remove default delete"""
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def delete_model(self, request, obj):
        """need to call model delete to keep comment_count up to date"""
        for instance in obj.all():
            CommentTmp.objects.get(pk=instance.pk).delete()

    delete_model.short_description = 'Delete selected'


# admin.site.register(CommentTmp, CommentTmpAdmin)


class BookAsArrayAdmin(KAdmin):
    list_display = ('book', 'chapter', 'text')
    list_filter = ('book', 'chapter')


admin.site.register(BookAsArray, BookAsArrayAdmin)


class KaraitesBookDetailsAdmin(KAdmin):
    save_on_top = True
    list_display = ('first_level', 'book_language',
                    'book_classification',
                    'book_title', 'author',
                    'intro_to_html')

    list_filter = ('first_level', 'book_language', 'book_classification')


admin.site.register(KaraitesBookDetails, KaraitesBookDetailsAdmin)


class KaraitesBookTextAsArrayAdmin(KAdmin):
    list_display = ('book', 'ref_chapter', 'paragraph_number', 'text', 'foot_notes_admin')

    list_filter = ('book',
                   'book__book_language', 'book__book_classification')


admin.site.register(KaraitesBookAsArray, KaraitesBookTextAsArrayAdmin)


class TableOfContentsAdmin(KAdmin):
    list_display = ('karaite_book', 'admin_subject', 'start_paragraph')

    list_filter = ('karaite_book',)


admin.site.register(TableOfContents, TableOfContentsAdmin)


class ReferencesAdmin(KAdmin):
    list_display = ('karaites_book', 'bible_ref_en', 'bible_ref_he',
                    'paragraph_number', 'paragraph_admin', 'foot_notes_admin')
    search_fields = ('bible_ref_en',)
    list_filter = ('karaites_book', 'bible_ref_en',)


admin.site.register(References, ReferencesAdmin)


class FullTextSearchAdmin(KAdmin):
    list_display = ('reference_en', 'text_en', 'reference_he', 'text_he', 'delete')
    search_fields = ('reference_en',)


admin.site.register(FullTextSearch, FullTextSearchAdmin)
