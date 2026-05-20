"""
SRF compliance domain — installments, payment proofs, exam periods, academic access.

Extends the core ledger models in models.py with business rules for:
- financial validation & installment tracking
- academic access / exam eligibility
- convention & internship gating
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel
from apps.admin_management.models import AcademicLevel, AcademicYear, Filiere


# ============================================================================
# FINANCIAL ACCOUNT EXTENSIONS (fields added via migration on FinancialAccount)
# ============================================================================

class PaymentPlanType(models.TextChoices):
    FULL = 'FULL', _('Full payment')
    INSTALLMENTS = 'INSTALLMENTS', _('Installments / tranches')


class FinancialComplianceStatus(models.TextChoices):
    CLEAR = 'CLEAR', _('Clear')
    PARTIAL = 'PARTIAL', _('Partial')
    OVERDUE = 'OVERDUE', _('Overdue')
    BLOCKED = 'BLOCKED', _('Blocked')
    AT_RISK = 'AT_RISK', _('At risk')
    PENDING_VALIDATION = 'PENDING_VALIDATION', _('Pending validation')


# ============================================================================
# INSTALLMENT (TRANCHE)
# ============================================================================

class Installment(TimestampedModel):
    """Single installment for INSTALLMENTS payment plan students."""

    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', _('Unpaid')
        PENDING_VALIDATION = 'PENDING_VALIDATION', _('Pending validation')
        PAID = 'PAID', _('Paid')
        OVERDUE = 'OVERDUE', _('Overdue')
        WAIVED = 'WAIVED', _('Waived')

    account = models.ForeignKey(
        'srf.FinancialAccount',
        on_delete=models.CASCADE,
        related_name='installments',
    )
    installment_number = models.PositiveSmallIntegerField(db_index=True)
    label = models.CharField(max_length=64, help_text=_('e.g. tranche_1'))
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='MAD')
    due_date = models.DateField(db_index=True)
    semester = models.PositiveSmallIntegerField(
        default=1,
        help_text=_('Semester this installment covers (1 or 2).'),
    )
    academic_year = models.CharField(max_length=16, db_index=True)
    payment_status = models.CharField(
        max_length=24,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
        db_index=True,
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_installments',
    )
    uploaded_receipt = models.FileField(
        upload_to='srf/installment_receipts/%Y/%m/',
        null=True,
        blank=True,
    )
    linked_payment = models.ForeignKey(
        'srf.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='installments',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['account', 'installment_number']
        constraints = [
            models.UniqueConstraint(
                fields=['account', 'installment_number', 'academic_year'],
                name='uniq_installment_per_account_year',
            ),
        ]
        indexes = [
            models.Index(fields=['payment_status', 'due_date']),
            models.Index(fields=['academic_year', 'semester', 'payment_status']),
        ]

    def __str__(self) -> str:
        return f'Installment<{self.account_id} #{self.installment_number} {self.payment_status}>'


# ============================================================================
# PAYMENT PROOF SUBMISSION (student upload → admin validation)
# ============================================================================

class PaymentProofSubmission(TimestampedModel):
    """Student-submitted payment proof awaiting admin validation."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        UNDER_REVIEW = 'UNDER_REVIEW', _('Under review')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        REQUIRES_CORRECTION = 'REQUIRES_CORRECTION', _('Requires correction')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    account = models.ForeignKey(
        'srf.FinancialAccount',
        on_delete=models.CASCADE,
        related_name='payment_proofs',
    )
    installment = models.ForeignKey(
        Installment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proof_submissions',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='MAD')
    reference_number = models.CharField(max_length=128, blank=True, default='')
    proof_file = models.FileField(upload_to='srf/payment_proofs/%Y/%m/')
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_payment_proofs',
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_payment_proofs',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')
    linked_payment = models.ForeignKey(
        'srf.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proof_submissions',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['account', 'status']),
        ]

    def __str__(self) -> str:
        return f'PaymentProof<{self.account_id} {self.status} {self.amount}>'


# ============================================================================
# PROGRAM EXAM PERIOD
# ============================================================================

class ProgramExamPeriod(TimestampedModel):
    """Configurable exam window per filière / semester / academic year."""

    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name='exam_periods',
    )
    academic_level = models.ForeignKey(
        AcademicLevel,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='exam_periods',
        help_text=_('Optional — when empty, applies to all levels in the program.'),
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='exam_periods',
    )
    semester = models.PositiveSmallIntegerField(default=1, db_index=True)
    exam_start = models.DateField(db_index=True)
    exam_end = models.DateField(db_index=True)
    convention_block_date = models.DateField(
        null=True,
        blank=True,
        help_text=_('Date from which internship conventions are blocked for unpaid students.'),
    )
    payment_deadline = models.DateField(
        null=True,
        blank=True,
        help_text=_('Last date to be financially clear before exams.'),
    )
    warning_days_before = models.PositiveSmallIntegerField(
        default=14,
        help_text=_('Days before exam_start to start AT_RISK warnings.'),
    )
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['-exam_start']
        constraints = [
            models.UniqueConstraint(
                fields=['filiere', 'academic_year', 'semester'],
                name='uniq_exam_period_program_semester',
            ),
        ]

    def __str__(self) -> str:
        return f'ExamPeriod<{self.filiere_id} S{self.semester} {self.academic_year_id}>'


# ============================================================================
# STUDENT ACADEMIC ACCESS (computed eligibility snapshot)
# ============================================================================

class StudentAcademicAccess(TimestampedModel):
    """Cached academic eligibility flags derived from financial state."""

    student_profile = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='academic_access',
    )
    can_take_exams = models.BooleanField(default=False, db_index=True)
    can_download_convention = models.BooleanField(default=False, db_index=True)
    internship_eligible = models.BooleanField(default=False, db_index=True)
    financial_clearance = models.BooleanField(default=False, db_index=True)
    blocking_reasons = models.JSONField(default=list, blank=True)
    required_semester = models.PositiveSmallIntegerField(default=1)
    computed_at = models.DateTimeField(auto_now=True)

    class Meta(TimestampedModel.Meta):
        verbose_name_plural = _('Student academic access records')

    def __str__(self) -> str:
        return (
            f'AcademicAccess<student={self.student_profile_id} '
            f'exams={self.can_take_exams} convention={self.can_download_convention}>'
        )


# ============================================================================
# FINANCIAL RISK ALERT
# ============================================================================

class FinancialRiskAlert(TimestampedModel):
    """System-generated alert for overdue / exam-risk students."""

    class AlertType(models.TextChoices):
        INSTALLMENT_OVERDUE = 'INSTALLMENT_OVERDUE', _('Installment overdue')
        EXAM_RESTRICTION = 'EXAM_RESTRICTION', _('Exam restriction warning')
        CONVENTION_BLOCKED = 'CONVENTION_BLOCKED', _('Convention blocked')
        PAYMENT_REJECTED = 'PAYMENT_REJECTED', _('Payment rejected')
        AT_RISK = 'AT_RISK', _('Financial at risk')
        GENERAL = 'GENERAL', _('General')

    class Severity(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='financial_risk_alerts',
    )
    account = models.ForeignKey(
        'srf.FinancialAccount',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='risk_alerts',
    )
    alert_type = models.CharField(max_length=32, choices=AlertType.choices, db_index=True)
    severity = models.CharField(
        max_length=16,
        choices=Severity.choices,
        default=Severity.MEDIUM,
        db_index=True,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_financial_alerts',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_resolved', 'severity']),
            models.Index(fields=['student_profile', 'is_resolved']),
        ]

    def __str__(self) -> str:
        return f'FinRiskAlert<{self.student_profile_id} {self.alert_type}>'
