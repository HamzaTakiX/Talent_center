from django.apps import AppConfig


class HistoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.history'
    label = 'history'
    verbose_name = 'History / Audit Trail'

    def ready(self) -> None:
        import apps.history.signals  # noqa: F401
