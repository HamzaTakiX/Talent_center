from django.apps import AppConfig


class StageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.stage'
    label = 'stage'
    verbose_name = 'Stage / Internship'
