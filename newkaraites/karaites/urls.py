from django.urls import path
from .views import BooksPresentation

app_name = 'karaites'

urlpatterns = [
    path('books-list/', BooksPresentation.as_view(), name='books_list'),
]