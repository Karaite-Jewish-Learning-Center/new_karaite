from django.http import JsonResponse
from django.views.generic import View
from .models import Organization


class BooksPresentation(View):

    @staticmethod
    def get(request):
        return JsonResponse(Organization.get_list_of_books(), safe=False)
