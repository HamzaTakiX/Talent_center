"""
SRF operations configuration — exam planning, warning tiers, templates, audit.
"""

from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.admin_management.models import AcademicLevel
from apps.accounts_et_roles.models import TimestampedModel


class SrfWarningTier(TimestampedModel):
    """Escalating reminder schedule relative to exam start."""

    class Severity(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    sort_order = models.PositiveSmallIntegerField(default=0, db_index=True)
    label = models.CharField(max_length=128)
    days_before_exam_start = models.PositiveSmallIntegerField(
        help_text=_('Activate this tier when exams are within N days.'),
    )
    severity = models.CharField(
        max_length=16,
        choices=Severity.choices,
        default=Severity.MEDIUM,
    )
    reminder_interval_days = models.PositiveSmallIntegerField(default=7)
    max_reminders = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text=_('Leave empty for unlimited reminders in this tier.'),
    )
    cooldown_hours = models.PositiveSmallIntegerField(default=0)
    block_convention = models.BooleanField(default=False)
    convention_block_days_before = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text=_('Block convention N days before exam_start when set.'),
    )
    block_exams = models.BooleanField(
        default=False,
        help_text=_('When true, exams are blocked at exam_start for non-clear students.'),
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-days_before_exam_start', 'sort_order']

    def __str__(self) -> str:
        return f'SrfWarningTier<{self.label} @{self.days_before_exam_start}d>'


class SrfRestrictionPolicy(TimestampedModel):
    """Singleton-style global restriction & automation policy."""

    class ExamGateMode(models.TextChoices):
        FULL_CLEARANCE = 'FULL_CLEARANCE', _('Full clearance — entire year must be paid')
        DUE_TRANCHES = 'DUE_TRANCHES', _('Due tranches — only tranches due before the exam must be paid')

    singleton_key = models.CharField(max_length=32, unique=True, default='default')
    stop_reminders_on_payment = models.BooleanField(default=True)
    mark_at_risk_on_warning = models.BooleanField(default=True)
    escalate_unresolved_after_days = models.PositiveSmallIntegerField(default=14)
    enable_email_notifications = models.BooleanField(default=True)
    enable_in_app_notifications = models.BooleanField(default=True)
    enable_critical_alerts = models.BooleanField(default=True)
    unpaid_blocks_exams = models.BooleanField(default=True)
    unpaid_blocks_convention = models.BooleanField(default=True)
    exam_gate_mode = models.CharField(
        max_length=16,
        choices=ExamGateMode.choices,
        default=ExamGateMode.DUE_TRANCHES,
        help_text=_(
            'Rule used to grant exam access for installment-plan students. '
            'DUE_TRANCHES lets a student sit exams once the tranches due on or before '
            'the exam date are paid, even if the full year is not yet settled.'
        ),
    )
    notes = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        verbose_name = _('SRF restriction policy')

    def __str__(self) -> str:
        return 'SrfRestrictionPolicy<default>'


class SrfNotificationTemplate(TimestampedModel):
    """Customizable message templates for automated SRF communications."""

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', _('Email')
        IN_APP = 'IN_APP', _('In-app')
        BOTH = 'BOTH', _('Email and in-app')

    class Severity(models.TextChoices):
        INFO = 'INFO', _('Info')
        WARNING = 'WARNING', _('Warning')
        CRITICAL = 'CRITICAL', _('Critical')

    code = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=128)
    channel = models.CharField(max_length=16, choices=Channel.choices, default=Channel.BOTH)
    severity = models.CharField(
        max_length=16,
        choices=Severity.choices,
        default=Severity.WARNING,
    )
    subject_template = models.CharField(max_length=255, blank=True, default='')
    body_template = models.TextField()
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'SrfNotificationTemplate<{self.code}>'


class SrfInstallmentPlanTemplate(TimestampedModel):
    """
    Reusable tranche schedule (ESCA-style) that splits a year's total fees
    into N installments, each with its own deadline.

    Optionally scoped to a program / level / academic year — the most specific
    active template wins, with an unscoped template acting as a global default.
    """

    class SplitMode(models.TextChoices):
        EQUAL = 'EQUAL', _('Equal split')
        CUSTOM = 'CUSTOM', _('Custom percentages')

    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    filiere = models.ForeignKey(
        'admin_management.Filiere',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='srf_installment_templates',
        help_text=_('Optional — when empty, the template applies to every program.'),
    )
    academic_level = models.ForeignKey(
        AcademicLevel,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='srf_installment_templates',
        help_text=_('Optional — when empty, applies to all levels in the program.'),
    )
    academic_year = models.ForeignKey(
        'admin_management.AcademicYear',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='srf_installment_templates',
        help_text=_('Optional — when empty, applies to every academic year.'),
    )
    number_of_tranches = models.PositiveSmallIntegerField(
        default=3,
        help_text=_('How many installments the yearly total is split into (usually 3 or 4).'),
    )
    split_mode = models.CharField(
        max_length=16,
        choices=SplitMode.choices,
        default=SplitMode.EQUAL,
    )
    currency = models.CharField(max_length=8, default='MAD')
    is_mandatory = models.BooleanField(
        default=True,
        help_text=_('When true, students in scope must follow this installment plan.'),
    )
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['filiere', '-is_active', 'name']
        verbose_name = _('SRF installment plan template')

    def __str__(self) -> str:
        return f'SrfInstallmentPlanTemplate<{self.name}>'

    @property
    def total_percentage(self):
        from decimal import Decimal

        return sum((t.percentage for t in self.tranches.all()), Decimal('0'))


class SrfInstallmentPlanTranche(TimestampedModel):
    """A single tranche of an installment plan template."""

    template = models.ForeignKey(
        SrfInstallmentPlanTemplate,
        on_delete=models.CASCADE,
        related_name='tranches',
    )
    tranche_number = models.PositiveSmallIntegerField(db_index=True)
    label = models.CharField(max_length=64, help_text=_('e.g. Tranche 1'))
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text=_('Share of the yearly total for this tranche (used for custom splits).'),
    )
    due_date = models.DateField(help_text=_('Deadline by which this tranche must be paid.'))
    semester = models.PositiveSmallIntegerField(default=1)

    class Meta(TimestampedModel.Meta):
        ordering = ['template', 'tranche_number']
        constraints = [
            models.UniqueConstraint(
                fields=['template', 'tranche_number'],
                name='uniq_tranche_per_template',
            ),
        ]

    def __str__(self) -> str:
        return f'SrfInstallmentPlanTranche<{self.template_id} #{self.tranche_number}>'


class SrfConfigAuditLog(models.Model):
    """Immutable audit trail for SRF configuration changes."""

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    action = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, db_index=True)
    entity_id = models.CharField(max_length=64, blank=True, default='')
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='srf_config_audit_logs',
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default='')
    message = models.TextField(blank=True, default='')
    before_json = models.JSONField(default=dict, blank=True)
    after_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['entity_type', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'SrfConfigAudit<{self.action} {self.entity_type}>'
