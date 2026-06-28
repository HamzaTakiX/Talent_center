"""Build absolute URLs for user-uploaded media (avatars, attachments, …)."""
from __future__ import annotations

import os

from django.conf import settings


def get_public_backend_url() -> str:
    """Origin for media links in API responses (no trailing slash)."""
    explicit = os.getenv('PUBLIC_BACKEND_URL', '').strip().rstrip('/')
    if explicit:
        return explicit
    railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '').strip()
    if railway_domain:
        host = railway_domain if railway_domain.startswith('http') else f'https://{railway_domain}'
        return host.rstrip('/')
    if not settings.DEBUG:
        return 'https://talentcenter-production.up.railway.app'
    return 'http://localhost:8000'


def build_absolute_media_url(value: str | None, request=None) -> str | None:
    """Turn a storage path or /media/… path into an absolute URL."""
    if not value:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    if raw.startswith(('http://', 'https://', 'data:', 'blob:')):
        return raw
    if request is not None:
        path = raw if raw.startswith('/') else f"{settings.MEDIA_URL.rstrip('/')}/{raw.lstrip('/')}"
        return request.build_absolute_uri(path)
    base = get_public_backend_url()
    if raw.startswith('/'):
        return f'{base}{raw}'
    media_prefix = settings.MEDIA_URL.rstrip('/')
    return f'{base}{media_prefix}/{raw.lstrip("/")}'


def resolve_student_profile_avatar_url(student, request=None) -> str | None:
    """Return absolute avatar URL for a StudentProfile (or compatible profile object)."""
    if not student:
        return None
    user = getattr(student, 'user', None)
    user_profile = getattr(user, 'profile', None) if user else None
    if not user_profile or not user_profile.avatar:
        return None
    try:
        return build_absolute_media_url(user_profile.avatar.url, request)
    except (ValueError, AttributeError):
        return None
