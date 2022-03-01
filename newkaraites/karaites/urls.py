from django.urls import path
from .views import (GetFirstLevel,
                    GetByLevelAndByClassification,
                    BooksPresentation,
                    GetBookAsArrayJson,
                    GetComments,
                    GetKaraitesAllBookDetails,
                    GetByLevel,
                    GetKaraitesBookAsArray,
                    GetTOC,
                    getHalakhah,
                    Test,
                    AutoCompleteView,
                    Search)

app_name = 'karaites'

urlpatterns = [

    path('get-first-level/', GetFirstLevel.as_view(), name='first_level'),

    # book list
    path('books-list/', BooksPresentation.as_view(), name='books_list'),

    path('get-book-chapter/<str:book>/<str:chapter>/<int:first>/',
         GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    path('get-book-chapter/<str:book>/', GetBookAsArrayJson.as_view(), name='get_book_chapter'),

    # karaite books
    path('get-karaites-book-chapter/<str:book>/<str:chapter>/<int:first>/',
         GetKaraitesBookAsArray.as_view(),
         name='get_karaites_book_chapter'),

    path('get-karaites-book/<str:book>/', GetKaraitesBookAsArray.as_view(), name='get_karaites_book'),
    path('get-karaites-book-details/', GetKaraitesAllBookDetails.as_view(), name='get_all_karaites_book_details'),
    path('get-karaites-book-toc/<str:book>/', GetTOC.as_view(), name='get_karaites_book_toc'),

    path('get-karaites-books-by-level/<str:level>/',
         GetByLevel.as_view(),
         name='get_karaites_book_by_level'),

    path('get-karaites-books-by-level-and-classification/<str:level>/',
         GetByLevelAndByClassification.as_view(),
         name='get_karaites_book_by_level_and_classification'),

    # comments
    path('get-comments/<str:book>/<str:chapter>/<str:verse>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/<str:chapter>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/<str:book>/', GetComments.as_view(), name='get_comments'),
    path('get-comments/', GetComments.as_view(), name='get_comments'),

    # references Halakhah
    path('get-references/<str:book>/<str:chapter>/<str:verse>/', getHalakhah.as_view(), name='get_references'),

    # very simple test
    path('test/', Test.as_view(), name='test'),

    # autocomplete / searching
    path('autocomplete/<str:search>/', AutoCompleteView.as_view(), name='autocomplete'),
    path('search/<str:search>/<int:page>/', Search.as_view(), name='autocomplete'),
    path('search/<str:search>/', Search.as_view(), name='autocomplete'),

]
