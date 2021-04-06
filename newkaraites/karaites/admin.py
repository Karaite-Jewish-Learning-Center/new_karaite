from django.contrib import admin
from .models import (Organization,
                     CommentAuthor,
                     Comment,
                     BookText)


class OrganizationAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book_title_en', 'book_title_he', 'order')
    search_fields = ('book_title_en', 'book_title_he')
    list_filter = ('book_title_en', 'book_title_he')
    list_editable = ('order',)


admin.site.register(Organization, OrganizationAdmin)


class CommentAuthorAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('name', 'history')
    search_fields = ('name',)
    list_filter = ('name',)


admin.site.register(CommentAuthor, CommentAuthorAdmin)


class CommentAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('comment', 'comment_language', 'comment_author')
    list_filter = ('comment_language',)


admin.site.register(Comment, CommentAdmin)


class BookTextAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('book', 'chapter_en', 'verse_en',
                    'chapter_he', 'verse_he','text_en',
                    'text_he')
    list_filter = ('book',)


admin.site.register(BookText, BookTextAdmin)
