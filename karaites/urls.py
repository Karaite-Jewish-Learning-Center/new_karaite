from django.urls import path
from .views import (GetFirstLevel,
                    GetByLevelAndByClassification,
                    GetBookAsArrayJson,
                    GetKaraitesAllBookDetails,
                    GetByLevel,
                    GetKaraitesBookAsArray,
                    GetTOC,
                    GetHalakhah,
                    Book,
                    Test,
                    AutoCompleteView,
                    Search,
                    GetBiBleReferences,
                    GetBiBleReferencesByLaw,
                    AudioBook)

app_name = 'karaites'

urlpatterns = [

    path('get-first-level/',
         GetFirstLevel.as_view(),
         name='first_level'),

    # book list
    path('get-book-chapter/<str:book>/<str:chapter>/<int:first>/',
         GetBookAsArrayJson.as_view(),
         name='get_book_chapter'),

    # audiobooks
    path('audio-book/<str:book>/',
         AudioBook.as_view(),
         name='audio_book'),

    # karaite books
    path('get-karaites-book-chapter/<str:book>/<str:chapter>/<int:first>/',
         GetKaraitesBookAsArray.as_view(),
         name='get_karaites_book_chapter'),

    path('get-karaites-book-details/',
         GetKaraitesAllBookDetails.as_view(),
         name='get_all_karaites_book_details'),

    path('get-karaites-book-toc/<str:book>/',
         GetTOC.as_view(),
         name='get_karaites_book_toc'),

    path('get-karaites-book-toc/',
         GetTOC.as_view(),
         name='get_karaites_book_toc'),

    path('get-karaites-books-by-level/<str:level>/',
         GetByLevel.as_view(),
         name='get_karaites_book_by_level'),

    path('get-karaites-books-by-level-and-classification/<str:level>/',
         GetByLevelAndByClassification.as_view(),
         name='get_karaites_book_by_level_and_classification'),

    # bible references
    path('get-bible-references/<str:reference>/<str:law>/',
         GetBiBleReferencesByLaw.as_view(),
         name='get_bible_references'),

    path('get-bible-references/<str:reference>/',
         GetBiBleReferences.as_view(),
         name='get_bible_references'),

    # references Halakhah
    path('get-references/<str:book>/<str:chapter>/<str:verse>/',
         GetHalakhah.as_view(),
         name='get_references'),

    # Better format should replace all the other formats in the long run
    path('book/<str:book>/',
         Book.as_view(),
         name='book'),

    # autocomplete / searching english/hebrew
    path('autocomplete/<str:search>/',
         AutoCompleteView.as_view(),
         name='autocomplete'),

    path('search/<str:search>/<int:page>/',
         Search.as_view(),
         name='autocomplete'),

    path('search/<str:search>/',
         Search.as_view(),
         name='autocomplete'),

    # very simple test
    path('test/',
         Test.as_view(),
         name='test'),
]
