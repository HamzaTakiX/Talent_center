"""Test settings — isolated PostgreSQL test database.

`core.settings` requires a PostgreSQL DATABASE_URL. Django then creates a
scratch database named TEST['NAME'] so the suite never writes into the app
schema. Set TEST_DATABASE_URL to point at a dedicated Postgres (recommended
instead of the production Railway URL).

Usage:
    python manage.py test --settings=core.settings_test
"""

import os

import dj_database_url

os.environ.setdefault('SECRET_KEY', 'test-only-secret-key')

from core.settings import *  # noqa: F401,F403,E402

_test_url = os.getenv('TEST_DATABASE_URL', '').strip()
if _test_url:
    DATABASES = {
        'default': dj_database_url.parse(
            _test_url,
            conn_max_age=0,
            conn_health_checks=False,
        )
    }

DATABASES['default']['TEST'] = {
    'NAME': os.getenv('TEST_DATABASE_NAME', 'test_talent_center'),
}


class _NoMigrations(dict):
    """Build the test schema straight from the current models.

    `admin_management.0013_seed_esca_academic_data` calls the live
    `seed_esca_academic()` service, which reads model fields introduced by later
    migrations. Replaying the historical chain therefore fails on a fresh
    database. Building from model state gives the same schema and keeps the test
    suite independent of the migration history; tests create the reference rows
    they need.
    """

    def __contains__(self, key):
        return True

    def __getitem__(self, key):
        return None


MIGRATION_MODULES = _NoMigrations()

DEBUG = False
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
CHANNEL_LAYERS = {'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}}

# Keep test output focused on assertion failures.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {'null': {'class': 'logging.NullHandler'}},
    'root': {'handlers': ['null'], 'level': 'CRITICAL'},
}
