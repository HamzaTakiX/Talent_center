import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import quote_plus

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Never override variables already set by Render/Railway/host (production).
load_dotenv(BASE_DIR / '.env', override=False)


def env(key: str, default: str = '') -> str:
    return os.environ.get(key, default)


def env_bool(key: str, default: bool = False) -> bool:
    raw = os.environ.get(key)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes', 'on'}


def env_int(key: str, default: int) -> int:
    raw = os.environ.get(key)
    if raw is None or raw == '':
        return default
    return int(raw)


def env_list(key: str, default: str = '') -> list[str]:
    raw = os.environ.get(key, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


def env_required(key: str) -> str:
    """Required in production — no localhost or dev defaults."""
    value = os.environ.get(key, '').strip()
    if not value:
        raise RuntimeError(f'Missing required environment variable: {key}')
    return value


# ---------- Security ----------
SECRET_KEY = env('SECRET_KEY', 'django-insecure-development-key-replace-in-production')
DEBUG = env_bool('DEBUG', True)
ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1') or ['*']

# ---------- Applications ----------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'apps.accounts_et_roles.apps.AccountsEtRolesConfig',
    'apps.authentication.apps.AuthenticationConfig',
    'apps.cv_builder.apps.CvBuilderConfig',
    'apps.profile_intelligence.apps.ProfileIntelligenceConfig',

    # Tier 1
    'apps.settings_app.apps.SettingsAppConfig',
    'apps.admin_management.apps.AdminManagementConfig',

    # Tier 2
    'apps.stage.apps.StageConfig',

    # Tier 3
    'apps.announcements.apps.AnnouncementsConfig',
    'apps.encadrant.apps.EncadrantConfig',
    'apps.documents.apps.DocumentsConfig',

    # Tier 4
    'apps.chat.apps.ChatConfig',
    'apps.notifications.apps.NotificationsConfig',
    'apps.srf.apps.SrfConfig',

    # Tier 5
    'apps.history.apps.HistoryConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.history.middleware.HistoryRequestMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'apps' / 'notifications' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ---------- Database ----------
def _database_url_from_pg_env() -> str:
    """Fallback when Railway sets PGHOST/PGUSER/... without a single DATABASE_URL."""
    host = (
        os.getenv('PGHOST', '').strip()
        or os.getenv('POSTGRES_HOST', '').strip()
    )
    if not host:
        return ''
    user = os.getenv('PGUSER') or os.getenv('POSTGRES_USER') or 'postgres'
    password = os.getenv('PGPASSWORD') or os.getenv('POSTGRES_PASSWORD') or ''
    name = os.getenv('PGDATABASE') or os.getenv('POSTGRES_DB') or 'railway'
    port = os.getenv('PGPORT') or os.getenv('POSTGRES_PORT') or '5432'
    credentials = (
        f'{quote_plus(user)}:{quote_plus(password)}@'
        if password
        else f'{quote_plus(user)}@'
    )
    return f'postgresql://{credentials}{host}:{port}/{quote_plus(name)}'


_ON_RAILWAY = bool(
    os.getenv('RAILWAY_ENVIRONMENT')
    or os.getenv('RAILWAY_SERVICE_ID')
    or os.getenv('RAILWAY_PROJECT_ID')
)

# Local + production must target the same Postgres: set DATABASE_URL in backend/.env
# (Railway public Connect URL) and reference the same URL on the Railway backend service.
_database_url = (
    os.getenv('DATABASE_URL', '').strip()
    or os.getenv('DATABASE_PRIVATE_URL', '').strip()
    or os.getenv('DATABASE_PUBLIC_URL', '').strip()
    or _database_url_from_pg_env()
)

if _database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            _database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif _ON_RAILWAY:
    raise RuntimeError(
        'Railway: set DATABASE_URL on the backend service (Reference → Postgres → '
        'DATABASE_URL), then redeploy.'
    )
elif DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    raise RuntimeError(
        'Set DATABASE_URL in backend/.env to your Railway PostgreSQL Connect URL.'
    )

print('DATABASE_ENGINE =', DATABASES['default'].get('ENGINE'))
print('DATABASE_NAME =', DATABASES['default'].get('NAME'))
print('DATABASE_HOST =', DATABASES['default'].get('HOST'))
print('DATABASE_PORT =', DATABASES['default'].get('PORT'))

# ---------- Auth / User ----------
AUTH_USER_MODEL = 'accounts_et_roles.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------- i18n ----------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Media (user-uploaded files: CV templates, avatars, attachments, ...)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
# Absolute origin for avatar/media URLs in API JSON (Vercel frontend + Railway backend).
PUBLIC_BACKEND_URL = os.getenv('PUBLIC_BACKEND_URL', '').strip().rstrip('/')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------- CORS (django-cors-headers) ----------
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN')
if FRONTEND_ORIGIN:
    FRONTEND_ORIGIN = FRONTEND_ORIGIN.strip().rstrip('/')

CORS_ALLOWED_ORIGINS = []
CSRF_TRUSTED_ORIGINS = []

if FRONTEND_ORIGIN:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_ORIGIN)
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_ORIGIN)

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

print('FRONTEND_ORIGIN =', FRONTEND_ORIGIN)
print('CORS_ALLOWED_ORIGINS =', CORS_ALLOWED_ORIGINS)

# ---------- DRF ----------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.authentication.authentication.SessionAwareJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'EXCEPTION_HANDLER': 'apps.authentication.exceptions.custom_exception_handler',
}

# ---------- SimpleJWT ----------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env_int('ACCESS_TOKEN_LIFETIME_MINUTES', 30)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env_int('REFRESH_TOKEN_LIFETIME_DAYS', 7)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'JTI_CLAIM': 'jti',
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# ---------- Email (legacy Django SMTP — use Notification Center for app emails) ----------
EMAIL_BACKEND = env('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', 'no-reply@talent-center.local')
EMAIL_HOST = env('EMAIL_HOST', '')
EMAIL_PORT = env_int('EMAIL_PORT', 587)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)

# ---------- CV Builder ----------
CV_ANALYSIS_PROVIDER = env('CV_ANALYSIS_PROVIDER', 'rule-based')
ANTHROPIC_API_KEY = env('ANTHROPIC_API_KEY', '')
CV_ANALYSIS_MODEL = env('CV_ANALYSIS_MODEL', 'claude-haiku-4-5')
CV_PUBLIC_SHARE_BASE_URL = env('CV_PUBLIC_SHARE_BASE_URL', 'http://localhost:5173/cv/public')

# ---------- Auth policy ----------
AUTH_MAX_FAILED_ATTEMPTS = env_int('AUTH_MAX_FAILED_ATTEMPTS', 5)
AUTH_FAILED_WINDOW_SECONDS = env_int('AUTH_FAILED_WINDOW_SECONDS', 900)
AUTH_LOCKOUT_SECONDS = env_int('AUTH_LOCKOUT_SECONDS', 900)
PASSWORD_RESET_TOKEN_TTL_SECONDS = env_int('PASSWORD_RESET_TOKEN_TTL_SECONDS', 1800)
FRONTEND_RESET_PASSWORD_URL = env('FRONTEND_RESET_PASSWORD_URL', 'http://localhost:5173/reset-password')
FRONTEND_BASE_URL = env('FRONTEND_BASE_URL', env('FRONTEND_ORIGIN', 'http://localhost:5173'))

# ---------- Notifications ----------
NOTIFICATION_EMAIL_PROVIDER = env('NOTIFICATION_EMAIL_PROVIDER', 'mock')
SENDGRID_API_KEY = env('SENDGRID_API_KEY', '')
SENDGRID_FROM_EMAIL = env('SENDGRID_FROM_EMAIL', DEFAULT_FROM_EMAIL)
SENDGRID_FROM_NAME = env('SENDGRID_FROM_NAME', 'Digital Talent Center')
NOTIFICATIONS_EMAIL_ENABLED = env_bool('NOTIFICATIONS_EMAIL_ENABLED', True)
NOTIFICATIONS_IN_APP_ENABLED = env_bool('NOTIFICATIONS_IN_APP_ENABLED', True)
NOTIFICATIONS_SMS_ENABLED = env_bool('NOTIFICATIONS_SMS_ENABLED', False)
NOTIFICATIONS_PUSH_ENABLED = env_bool('NOTIFICATIONS_PUSH_ENABLED', False)
NOTIFICATIONS_DIGEST_ENABLED = env_bool('NOTIFICATIONS_DIGEST_ENABLED', True)
NOTIFICATION_DEFAULT_LANGUAGE = env('NOTIFICATION_DEFAULT_LANGUAGE', 'en')
NOTIFICATION_RATE_LIMIT_EMAIL_PER_HOUR = env_int('NOTIFICATION_RATE_LIMIT_EMAIL_PER_HOUR', 20)
NOTIFICATION_RATE_LIMIT_GLOBAL_PER_MINUTE = env_int('NOTIFICATION_RATE_LIMIT_GLOBAL_PER_MINUTE', 100)
REDIS_URL = env('REDIS_URL', '')
CELERY_BROKER_URL = env('CELERY_BROKER_URL', REDIS_URL)
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', REDIS_URL)
CELERY_TASK_ALWAYS_EAGER = env_bool('CELERY_TASK_ALWAYS_EAGER', not bool(REDIS_URL))
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

if REDIS_URL:
    INSTALLED_APPS += ['django_celery_beat']


# ---------- Auth providers ----------
# Local is always enabled. Remote providers default OFF and ship as stubs
# in apps.authentication.providers.*. To activate a provider you only need
# to (1) implement its authenticate/begin/callback and (2) flip its ENABLED
# flag — no other code changes required.
AUTH_PROVIDERS = {
    'LOCAL': {
        'ENABLED': True,
        'JIT_PROVISION': False,
    },
    'AUTH0': {
        'ENABLED': env_bool('AUTH0_ENABLED', False),
        'DOMAIN': env('AUTH0_DOMAIN', ''),
        'CLIENT_ID': env('AUTH0_CLIENT_ID', ''),
        'CLIENT_SECRET': env('AUTH0_CLIENT_SECRET', ''),
        'REDIRECT_URI': env('AUTH0_REDIRECT_URI', ''),
        'JIT_PROVISION': env_bool('AUTH0_JIT', True),
    },
    'MICROSOFT': {
        'ENABLED': env_bool('MS_ENABLED', False),
        'TENANT_ID': env('MS_TENANT_ID', ''),
        'CLIENT_ID': env('MS_CLIENT_ID', ''),
        'CLIENT_SECRET': env('MS_CLIENT_SECRET', ''),
        'REDIRECT_URI': env('MS_REDIRECT_URI', ''),
        'JIT_PROVISION': env_bool('MS_JIT', True),
    },
    'SSO': {
        'ENABLED': env_bool('SSO_ENABLED', False),
        'METADATA_URL': env('SSO_METADATA_URL', ''),
        'JIT_PROVISION': env_bool('SSO_JIT', False),
    },
}
