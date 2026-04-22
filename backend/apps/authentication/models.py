from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class LoginSession(models.Model):
    """Single authenticated session tied to a JWT jti."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions',
    )
    jti = models.CharField(max_length=64, unique=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    device_name = models.CharField(max_length=128, blank=True, default='')
    expires_at = models.DateTimeField(db_index=True)
    revoked_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'revoked_at']),
            models.Index(fields=['user', 'expires_at']),
        ]

    def __str__(self):
        return f'Session<{self.user_id}:{self.jti[:8]}>'

    def is_active(self) -> bool:
        return self.revoked_at is None and self.expires_at > timezone.now()

    def revoke(self) -> None:
        if self.revoked_at is None:
            self.revoked_at = timezone.now()
            self.save(update_fields=['revoked_at'])


class LoginAttempt(models.Model):
    """Audit row written on every login attempt (success or failure)."""

    class FailureReason(models.TextChoices):
        NONE = '', _('')
        INVALID_CREDENTIALS = 'invalid_credentials', _('Invalid credentials')
        INACTIVE_ACCOUNT = 'inactive_account', _('Inactive account')
        LOCKED = 'locked', _('Locked')
        UNKNOWN_USER = 'unknown_user', _('Unknown user')
        PROVIDER_ERROR = 'provider_error', _('Provider error')

    identifier = models.CharField(max_length=255, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    success = models.BooleanField(db_index=True)
    failure_reason = models.CharField(
        max_length=64,
        blank=True,
        default='',
        choices=FailureReason.choices,
    )
    provider = models.CharField(max_length=32, default='LOCAL')
    attempted_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['identifier', 'attempted_at']),
            models.Index(fields=['ip_address', 'attempted_at']),
        ]

    def __str__(self):
        status = 'OK' if self.success else f'FAIL({self.failure_reason})'
        return f'Attempt<{self.identifier} {status}>'


class PasswordResetRequest(models.Model):
    """Password reset token record. Token is stored as a SHA-256 hash."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_resets',
    )
    token = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Reset<{self.user_id}>'

    def is_valid(self) -> bool:
        return self.used_at is None and self.expires_at > timezone.now()


class SecurityEvent(models.Model):
    """Append-only log of auth-relevant events for audit / SIEM export."""

    class EventType(models.TextChoices):
        LOGIN_SUCCESS = 'LOGIN_SUCCESS', _('Login success')
        LOGIN_FAILURE = 'LOGIN_FAILURE', _('Login failure')
        LOGOUT = 'LOGOUT', _('Logout')
        LOGOUT_ALL = 'LOGOUT_ALL', _('Logout all')
        PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED', _('Password reset requested')
        PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED', _('Password reset completed')
        PASSWORD_CHANGED = 'PASSWORD_CHANGED', _('Password changed')
        SUSPICIOUS_LOCKOUT = 'SUSPICIOUS_LOCKOUT', _('Suspicious lockout')
        SESSION_REVOKED = 'SESSION_REVOKED', _('Session revoked')
        TOKEN_REFRESHED = 'TOKEN_REFRESHED', _('Token refreshed')
        PROVIDER_LINKED = 'PROVIDER_LINKED', _('Provider linked')

    event_type = models.CharField(max_length=48, choices=EventType.choices, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_events',
    )
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Event<{self.event_type} user={self.user_id}>'
