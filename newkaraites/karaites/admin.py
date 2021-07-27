from django.contrib import admin
from .models import (Organization,
                     Author,
                     Comment,
                     CommentTmp,
                     OtherBooks,
                     BookText,
                     BookAsArray,
                     KaraitesBookDetails,
                     KaraitesBookAsArray,
                     KaraitesBookText)

from .admin_forms import AdminCommentForm


class OrganizationAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('first_level', 'second_level',
                    'book_title_en', 'book_title_he',
                    'chapter_show', 'verses', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }


admin.site.register(Organization, OrganizationAdmin)


class OtherBooksAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book_title_en', 'book_title_he', 'author', 'classification')
    search_fields = ('book_title_en', 'book_title_he', 'author')
    list_filter = ('classification',)


admin.site.register(OtherBooks, OtherBooksAdmin)


class AuthorAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('name', 'comments_count_en', 'comments_count_he', 'history')
    search_fields = ('name',)
    list_filter = ('name',)

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }


admin.site.register(Author, AuthorAdmin)


class CommentAdmin(admin.ModelAdmin):
    form = AdminCommentForm
    save_on_top = True
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

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)

        }
        js = ('../static/js/toggleFilterPanel.js',)


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


admin.site.register(CommentTmp, CommentTmpAdmin)


class BookAsArrayAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter', 'text')
    list_filter = ('book', 'chapter')

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }
        js = ('../static/js/toggleFilterPanel.js',)


admin.site.register(BookAsArray, BookAsArrayAdmin)


class BookTextAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter', 'verse',
                    'text_en', 'comments_count_en',
                    'comments_count_he', 'text_he', 'verse_he_admin',
                    'chapter_he_admin', 'book_he_admin',)

    list_filter = ('book', 'chapter', 'verse')

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }
        js = ('../static/js/toggleFilterPanel.js',)


admin.site.register(BookText, BookTextAdmin)


class KaraitesBookDetailsAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book_language', 'book_classification',
                    'book_title', 'author')

    list_filter = ('book_language', 'book_classification')

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }
        js = ('../static/js/toggleFilterPanel.js',)


admin.site.register(KaraitesBookDetails, KaraitesBookDetailsAdmin)


class KaraitesBookTextAsArrayAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'page', 'paragraph_number', 'text', 'foot_notes_admin')

    list_filter = ('book',
                   'book__book_language', 'book__book_classification')

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }
        js = ('../static/js/toggleFilterPanel.js',)


admin.site.register(KaraitesBookAsArray, KaraitesBookTextAsArrayAdmin)


class KaraitesBookTextAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter_number', 'chapter_number_la_admin',
                    'chapter_title_admin', 'chapter_text_admin',
                    'foot_notes_admin')

    list_filter = ('book',
                   'book__book_language', 'book__book_classification')

    class Media:
        css = {
            'all': ('../static/css/admin.css',
                    '../static/css/tooltip.css',)
        }
        js = ('../static/js/toggleFilterPanel.js',)


admin.site.register(KaraitesBookText, KaraitesBookTextAdmin)
