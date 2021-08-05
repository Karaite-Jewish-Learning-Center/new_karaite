from django.urls import path
from .views import (BooksPresentation,
                    GetBookAsArrayJson,
                    GetBookAsArrayJsonOld,
                    GetComments,
                    GetKaraitesBookAsArray)

app_name = 'karaites'

urlpatterns = [

    # book list
    path('books-list/', BooksPresentation.as_view(), name='books_list'),

    
    path('get-book-chapter/<str:book>/<str:chapter>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    path('get-book-chapter/<str:book>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),


    # karaite books
    path('get-karaites-book/<str:book>/<str:chapter>/',
         GetKaraitesBookAsArray.as_view(),
         name='get_karaites_book_chapter'),

    path('get-karaites-book/<str:book>/', GetKaraitesBookAsArray.as_view(), name='get_karaites_book'),

    # comments
    path('get-comments/<str:book>/<str:chapter>/<str:verse>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/<str:chapter>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/', GetComments.as_view(), name='get_comments'),

]
