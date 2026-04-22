from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.authentication'
    label = 'authentication'
    verbose_name = 'Authentication'

    def ready(self):
        # Trigger provider self-registration at app-ready time.
        from .providers import registry  # noqa: F401
        from .providers import local, auth0, microsoft, sso  # noqa: F401
