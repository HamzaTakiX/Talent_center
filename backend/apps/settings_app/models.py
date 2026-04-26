"""
Settings app — declarative configuration registry + per-user / global values.

Design:
- AppSettingsRegistry is the SCHEMA: what keys exist, their types, defaults.
- UserAppSettings is per-user values overlaying the registry defaults.
- GeneralSettings stores platform-wide tunables (single source of truth).
- SecuritySettings stores security-domain tunables, kept separate so
  RBAC can guard write access independently from general settings.
"""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel


# ============================================================================
# 1. REGISTRY — declarative catalog
# ============================================================================

class AppSettingsRegistry(TimestampedModel):
    """
    Declarative entry describing one configurable setting key.

    Seed rows for every tunable the platform exposes. The `category` and
    `value_type` allow generic admin UIs to render the right widget without
    hardcoding every key.
    """

    class Category(models.TextChoices):
        GENERAL = 'GENERAL', _('General')
        SECURITY = 'SECURITY', _('Security')
        NOTIFICATIONS = 'NOTIFICATIONS', _('Notifications')
        INTEGRATIONS = 'INTEGRATIONS', _('Integrations')
        UI = 'UI', _('UI')
        FEATURE_FLAGS = 'FEATURE_FLAGS', _('Feature flags')

    class ValueType(models.TextChoices):
        STRING = 'STRING', _('String')
        INTEGER = 'INTEGER', _('Integer')
        FLOAT = 'FLOAT', _('Float')
        BOOLEAN = 'BOOLEAN', _('Boolean')
        JSON = 'JSON', _('JSON')

    key = models.SlugField(max_length=128, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.GENERAL,
        db_index=True,
    )
    value_type = models.CharField(
        max_length=16,
        choices=ValueType.choices,
        default=ValueType.STRING,
    )
    default_value_json = models.JSONField(default=dict, blank=True)
    is_user_configurable = models.BooleanField(default=False, db_index=True)
    is_system = models.BooleanField(
        default=False,
        help_text=_('Built-in entries cannot be deleted by admins.'),
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['category', 'key']
        indexes = [
            models.Index(fields=['category', 'is_user_configurable']),
        ]

    def __str__(self) -> str:
        return f'Setting<{self.key}>'


# ============================================================================
# 2. USER-SCOPED VALUES
# ============================================================================

class UserAppSettings(TimestampedModel):
    """Per-user overlay value for a registry key."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='app_settings',
    )
    setting = models.ForeignKey(
        AppSettingsRegistry,
        on_delete=models.CASCADE,
        related_name='user_values',
    )
    value_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'setting'],
                name='uniq_user_setting',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'setting']),
        ]

    def __str__(self) -> str:
        return f'UserSetting<{self.user_id}:{self.setting_id}>'


# ============================================================================
# 3. GLOBAL TUNABLES
# ============================================================================

class GeneralSettings(TimestampedModel):
    """
    System-wide setting value (one row per key).

    Decoupled from AppSettingsRegistry so that values can exist before
    the registry is seeded (bootstrap order) and so reads stay cheap.
    """

    key = models.SlugField(max_length=128, unique=True)
    value_json = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, default='')
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['key']

    def __str__(self) -> str:
        return f'GeneralSetting<{self.key}>'


class SecuritySettings(TimestampedModel):
    """
    Security-domain settings (lockout thresholds, password policy, MFA...).

    Kept in a separate table so the security operator role can write to it
    without granting write access to GeneralSettings.
    """

    key = models.SlugField(max_length=128, unique=True)
    value_json = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, default='')
    requires_2fa_to_change = models.BooleanField(default=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['key']

    def __str__(self) -> str:
        return f'SecuritySetting<{self.key}>'
