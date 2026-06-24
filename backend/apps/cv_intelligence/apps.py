from django.apps import AppConfig


class CvIntelligenceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.cv_intelligence'
    verbose_name = 'CV Intelligence'

    def ready(self) -> None:
        from core.ollama_autostart import ensure_ollama_running

        ensure_ollama_running()
