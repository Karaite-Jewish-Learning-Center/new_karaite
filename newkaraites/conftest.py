import pytest
from django.conf import settings


@pytest.fixture(scope='session')
def django_db_setup():
    # in this case database is tested read only, so we can use the same as production
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'karaites_test',
        'ATOMIC_REQUESTS': False,
    }
