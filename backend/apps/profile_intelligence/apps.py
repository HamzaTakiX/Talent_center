from django.apps import AppConfig


class ProfileIntelligenceConfig(AppConfig):
    """
    Central config for the Student Profile Intelligence System.

    This app owns:
      - activity/behaviour logs for student profiles
      - derived indicators (health, engagement, risk)
      - contextual per-module data summaries
      - profile state machine, suggestions, snapshots

    It does NOT own student identity or CV content — those live in
    accounts_et_roles and cv_builder respectively. Cross-app coupling
    is handled via the service layer and signals registered in ready().
    """

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.profile_intelligence'
    verbose_name = 'Student Profile Intelligence'

    def ready(self):
        # Importing signals wires receivers (auth login, CV updates...)
        # into the dispatch table. The import is kept local so Django
        # avoids cyclic app-loading issues.
        from . import signals  # noqa: F401
