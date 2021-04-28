from django.contrib import admin
from .models import (Organization,
                     CommentAuthor,
                     Comment,
                     BookText)
from .admin_forms import AdminCommentForm


class OrganizationAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('first_level', 'second_level',
                    'book_title_en', 'book_title_he',
                    'chapters', 'verses', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)

    class Media:
        css = {
            'all': ('../static/css/admin.css',)
        }


admin.site.register(Organization, OrganizationAdmin)


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
    form = AdminCommentForm
    save_on_top = True
    list_display = ('book', 'chapter', 'verse', 'english',
                    'hebrew', 'comment_author',
                    'comments_count')
    list_filter = ('comment_author', 'book')

    # def get_actions(self, request):
    #     actions = super().get_actions(request)
    #     if 'delete_selected' in actions:
    #         del actions['delete_selected']
    #     return actions

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
