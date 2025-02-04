from django.apps import AppConfig


class KaraitesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'karaites'

    def ready(self):
        import karaites.signals  # Import signals when app is ready
