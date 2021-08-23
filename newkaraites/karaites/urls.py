from django.urls import path
from .views import (GetFirstLevel,
                    BooksPresentation,
                    GetBookAsArrayJson,
                    GetComments,
                    getKaraitesAllBookDetails,
                    GetKaraitesBookAsArray,
                    GetTOC)

app_name = 'karaites'

urlpatterns = [

    path('get-first-level/', GetFirstLevel.as_view(), name='books_list'),
    # book list
    path('books-list/', BooksPresentation.as_view(), name='books_list'),


    path('get-book-chapter/<str:book>/<str:chapter>/<int:first>/',
         GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    path('get-book-chapter/<str:book>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),


    # karaite books
    path('get-karaites-book/<str:book>/<str:chapter>/',
         GetKaraitesBookAsArray.as_view(),
         name='get_karaites_book_chapter'),

    path('get-karaites-book/<str:book>/', GetKaraitesBookAsArray.as_view(), name='get_karaites_book'),

    path('get-karaites-book-details/', getKaraitesAllBookDetails.as_view(), name='get_all_karaites_book_details'),

    path('get-karaites-book-toc/<str:book>/', GetTOC.as_view(), name='get_karaites_book_toc'),

    # comments
    path('get-comments/<str:book>/<str:chapter>/<str:verse>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/<str:chapter>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/', GetComments.as_view(), name='get_comments'),

]
