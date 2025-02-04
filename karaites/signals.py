from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.urls import reverse

from .models import FirstLevel, KaraitesBookDetails, Organization, TableOfContents


def clear_cache_for_url_pattern(pattern_name):
    """Clear cache for a specific URL pattern"""
    try:
        url = reverse(pattern_name)
        cache.delete(f'views.decorators.cache.cache_page.{url}')
    except:
        pass


@receiver([post_save, post_delete], sender=FirstLevel)
def invalidate_firstlevel_cache(sender, **kwargs):
    clear_cache_for_url_pattern('get-first-level')


@receiver([post_save, post_delete], sender=KaraitesBookDetails)
def invalidate_book_details_cache(sender, instance, **kwargs):
    # Clear general cache
    clear_cache_for_url_pattern('get-karaites-book-details')

    # Clear specific book cache if we have the book title
    if hasattr(instance, 'book_title_unslug'):
        specific_url = reverse('get-book-details', kwargs={'book': instance.book_title_unslug})
        cache.delete(f'views.decorators.cache.cache_page.{specific_url}')


@receiver([post_save, post_delete], sender=Organization)
def invalidate_organization_cache(sender, **kwargs):
    clear_cache_for_url_pattern('books-presentation')


@receiver([post_save, post_delete], sender=TableOfContents)
def invalidate_toc_cache(sender, **kwargs):
    clear_cache_for_url_pattern('get-toc')
