"""User notification preference checks."""

from __future__ import annotations

from django.conf import settings

from apps.notifications.events.registry import EventConfig
from apps.notifications.models import NotificationPreference, NotificationRecipient
from apps.notifications.services.email_config_service import (
    get_default_language,
    is_category_channel_enabled,
    is_platform_email_enabled,
)


def get_user_language(user) -> str:
    profile = getattr(user, 'profile', None)
    if profile and profile.language:
        lang = profile.language.lower()[:2]
        if lang in ('fr', 'en', 'ar'):
            return lang
    return get_default_language()


def should_deliver(
    *,
    user,
    channel: str,
    config: EventConfig,
    urgent: bool = False,
) -> tuple[bool, str]:
    """Return (enabled, frequency). Urgent events bypass preference opt-out for email."""
    if channel == NotificationRecipient.Channel.EMAIL and not is_platform_email_enabled():
        return False, NotificationPreference.Frequency.NEVER

    if not is_category_channel_enabled(config.category, channel):
        return False, NotificationPreference.Frequency.NEVER

    if urgent and channel == NotificationRecipient.Channel.EMAIL:
        return True, NotificationPreference.Frequency.REALTIME

    pref = NotificationPreference.objects.filter(
        user=user,
        category=config.category,
        channel=channel,
    ).first()

    if pref is None:
        return _default_enabled(channel, config.category), NotificationPreference.Frequency.REALTIME

    if not pref.is_enabled or pref.frequency == NotificationPreference.Frequency.NEVER:
        return False, NotificationPreference.Frequency.NEVER

    return True, pref.frequency


def _default_enabled(channel: str, category: str) -> bool:
    if channel == NotificationRecipient.Channel.EMAIL:
        return is_platform_email_enabled()
    if channel == NotificationRecipient.Channel.IN_APP:
        if not is_category_channel_enabled(category, channel):
            return False
        return getattr(settings, 'NOTIFICATIONS_IN_APP_ENABLED', True)
    if channel == NotificationRecipient.Channel.SMS:
        return getattr(settings, 'NOTIFICATIONS_SMS_ENABLED', False)
    if channel == NotificationRecipient.Channel.PUSH:
        return getattr(settings, 'NOTIFICATIONS_PUSH_ENABLED', False)
    return True


def is_digest_frequency(frequency: str) -> bool:
    return frequency in (
        NotificationPreference.Frequency.DAILY_DIGEST,
        NotificationPreference.Frequency.WEEKLY_DIGEST,
        NotificationPreference.Frequency.MONTHLY_DIGEST,
    )
