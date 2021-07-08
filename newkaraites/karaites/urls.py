from django.urls import path
from .views import (BooksPresentation,
                    GetBookChapterVerses,
                    GetBookAsArrayJson,
                    GetBookAsArrayJsonOld,
                    GetBookChapterVersesFromRef,
                    GetComments,
                    GetKaraitesBook)

app_name = 'karaites'

urlpatterns = [

    # book list
    path('books-list/', BooksPresentation.as_view(), name='books_list'),

    # books
    path('get-book/<str:book>/<str:chapter>/<str:verse>/<str:stop_verse>/', GetBookChapterVerses.as_view(),
         name='get_book'),
    path('get-book/<str:book>/<str:chapter>/<str:verse>/', GetBookChapterVerses.as_view(), name='get_book'),
    path('get-book/<str:book>/<str:chapter>/', GetBookChapterVerses.as_view(), name='get_book'),

    path('get-book-chapter/<str:book>/<str:chapter>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    # deprecated
    path('get-book-chapter-old/<str:book>/<str:chapter>/', GetBookAsArrayJsonOld.as_view(), name='get_book_chapter_old'),

    path('get-book-chapter/<str:book>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    path('get-book/<str:book>/', GetBookChapterVerses.as_view(), name='get_book'),
    path('get-book/', GetBookChapterVerses.as_view(), name='get_book'),

    path('get-book-from-ref/<str:biblical_ref>/', GetBookChapterVersesFromRef.as_view()),

    # karaite books
    path('get-karaites-book/<str:book>/<str:chapter>/', GetKaraitesBook.as_view(), name='get_karaites_book_chapter'),
    path('get-karaites-book/<str:book>/', GetKaraitesBook.as_view(), name='get_karaites_book'),

    # comments
    path('get-comments/<str:book>/<str:chapter>/<str:verse>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/<str:chapter>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/', GetComments.as_view(), name='get_comments'),

]
