from django.contrib import admin
from .models import (Organization,
                     # ChapterVerse,
                     CommentAuthor,
                     Comment,
                     BookText)


class OrganizationAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('first_level', 'second_level',
                    'book_title_en', 'book_title_he',
                    'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)

    class Media:
        css = {
            'all': ('../static/css/admin.css',)
        }


admin.site.register(Organization, OrganizationAdmin)


# class ChapterVerseAdmin(admin.ModelAdmin):
#     save_on_top = True
#     list_display = ('book', 'chapter', 'verses')
#     search_fields = ('book',)
#     list_filter = ('book',)
#
#     class Media:
#         css = {
#             'all': ('../static/css/admin.css',)
#         }
#
#
# admin.site.register(ChapterVerse, ChapterVerseAdmin)


class CommentAuthorAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('name', 'history')
    search_fields = ('name',)
    list_filter = ('name',)

    class Media:
        css = {
            'all': ('../static/css/admin.css',)
        }


admin.site.register(CommentAuthor, CommentAuthorAdmin)


class CommentAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter', 'verse', 'comment_en',
                    'comment_he', 'comment_author',
                    'comments_count')

    list_filter = ('comment_author', 'book')

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    class Media:
        css = {
            'all': ('../static/css/admin.css',)
        }


admin.site.register(Comment, CommentAdmin)


class BookTextAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter', 'verse',
                    'text_en', 'text_he', 'comments_count')

    list_filter = ('book', 'chapter', 'verse')

    class Media:
        css = {
            'all': ('../static/css/admin.css',)
        }


admin.site.register(BookText, BookTextAdmin)
