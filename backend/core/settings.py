import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


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
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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
_db_engine = env('DB_ENGINE', 'sqlite').lower()
if _db_engine in ('postgresql', 'postgres'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME', 'talent_center'),
            'USER': env('DB_USER', 'postgres'),
            'PASSWORD': env('DB_PASSWORD', ''),
            'HOST': env('DB_HOST', 'localhost'),
            'PORT': env('DB_PORT', '5432'),
        }
    }
elif _db_engine == 'mysql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': env('DB_NAME', 'talent_center'),
            'USER': env('DB_USER', 'root'),
            'PASSWORD': env('DB_PASSWORD', ''),
            'HOST': env('DB_HOST', '127.0.0.1'),
            'PORT': env('DB_PORT', '3306'),
            'OPTIONS': {'charset': 'utf8mb4'},
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

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

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------- CORS ----------
FRONTEND_ORIGIN = env('FRONTEND_ORIGIN', 'http://localhost:5173')
if DEBUG and not FRONTEND_ORIGIN:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN] if FRONTEND_ORIGIN else []
CORS_ALLOW_CREDENTIALS = True

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

# ---------- Email ----------
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
