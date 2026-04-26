"""
SRF — Suivi des Règlements Financiers (Financial Follow-up).

Domain:
- FeeType / PaymentMethod = catalogs.
- FinancialAccount = the student's running account.
- FinancialLine = each charge or credit posted to an account.
- Payment / PaymentReceipt = inbound money.
- FinancialHold = block on services pending payment.
- ExemptionAndAdjustment = scholarships, write-offs, discounts.
- NotificationCampaign = bulk reminder dispatch.
- CashflowSnapshot = daily/periodic financial point-in-time record.

All monetary fields use DecimalField (max_digits=12, decimal_places=2)
to avoid floating-point rounding. Currency is stored alongside the
amount on every row that holds money.
"""

import uuid

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# ============================================================================
# 1. FEE TYPE
# ============================================================================

class FeeType(TimestampedModel):
    """Catalog of fee kinds (tuition, exam, registration, misc...)."""

    class Category(models.TextChoices):
        TUITION = 'TUITION', _('Tuition')
        REGISTRATION = 'REGISTRATION', _('Registration')
        EXAM = 'EXAM', _('Exam')
        HOUSING = 'HOUSING', _('Housing')
        TRANSPORT = 'TRANSPORT', _('Transport')
        MISC = 'MISC', _('Miscellaneous')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.TUITION,
        db_index=True,
    )
    default_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    default_currency = models.CharField(max_length=8, default='MAD')
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['category', 'code']

    def __str__(self) -> str:
        return f'FeeType<{self.code}>'


# ============================================================================
# 2. PAYMENT METHOD
# ============================================================================

class PaymentMethod(TimestampedModel):
    """Catalog of accepted payment methods."""

    class MethodType(models.TextChoices):
        CASH = 'CASH', _('Cash')
        BANK_TRANSFER = 'BANK_TRANSFER', _('Bank transfer')
        CHECK = 'CHECK', _('Check')
        CARD = 'CARD', _('Card')
        MOBILE = 'MOBILE', _('Mobile payment')
        OTHER = 'OTHER', _('Other')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    method_type = models.CharField(
        max_length=16,
        choices=MethodType.choices,
        db_index=True,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    requires_reference = models.BooleanField(default=False)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['method_type', 'code']

    def __str__(self) -> str:
        return f'PaymentMethod<{self.code}>'


# ============================================================================
# 3. FINANCIAL ACCOUNT
# ============================================================================

class FinancialAccount(TimestampedModel):
    """Per-student running financial account."""

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        SUSPENDED = 'SUSPENDED', _('Suspended')
        CLOSED = 'CLOSED', _('Closed')

    student_profile = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='financial_account',
    )
    account_number = models.CharField(max_length=32, unique=True)
    balance = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=0,
        help_text=_('Positive = student owes; negative = credit balance.'),
    )
    currency = models.CharField(max_length=8, default='MAD')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    last_payment_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'FinAccount<{self.account_number}>'


# ============================================================================
# 4. FINANCIAL LINE — charge or credit
# ============================================================================

class FinancialLine(TimestampedModel):
    """Single charge or credit posted to an account."""

    class LineType(models.TextChoices):
        CHARGE = 'CHARGE', _('Charge')
        CREDIT = 'CREDIT', _('Credit')
        REFUND = 'REFUND', _('Refund')
        ADJUSTMENT = 'ADJUSTMENT', _('Adjustment')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PARTIAL = 'PARTIAL', _('Partially paid')
        PAID = 'PAID', _('Paid')
        OVERDUE = 'OVERDUE', _('Overdue')
        CANCELLED = 'CANCELLED', _('Cancelled')
        WAIVED = 'WAIVED', _('Waived')

    account = models.ForeignKey(
        FinancialAccount,
        on_delete=models.CASCADE,
        related_name='lines',
    )
    fee_type = models.ForeignKey(
        FeeType,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='lines',
    )
    line_type = models.CharField(
        max_length=16,
        choices=LineType.choices,
        default=LineType.CHARGE,
        db_index=True,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='MAD')
    due_date = models.DateField(null=True, blank=True, db_index=True)
    description = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    academic_year = models.CharField(max_length=16, blank=True, default='', db_index=True)
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=0,
        help_text=_('Cumulative amount paid against this line.'),
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['due_date', '-created_at']
        indexes = [
            models.Index(fields=['account', 'status']),
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['academic_year', 'status']),
        ]

    def __str__(self) -> str:
        return f'FinLine<{self.account_id} {self.line_type} {self.amount}>'


# ============================================================================
# 5. PAYMENT
# ============================================================================

class Payment(TimestampedModel):
    """Inbound payment from a student."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')
        CANCELLED = 'CANCELLED', _('Cancelled')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    account = models.ForeignKey(
        FinancialAccount,
        on_delete=models.PROTECT,
        related_name='payments',
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.PROTECT,
        related_name='payments',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='MAD')
    payment_date = models.DateTimeField(db_index=True)
    reference_number = models.CharField(max_length=128, blank=True, default='', db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    notes = models.TextField(blank=True, default='')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='recorded_payments',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['account', '-payment_date']),
            models.Index(fields=['status', '-payment_date']),
            models.Index(fields=['payment_method', '-payment_date']),
        ]

    def __str__(self) -> str:
        return f'Payment<{self.account_id} {self.amount} {self.currency}>'


# ============================================================================
# 6. PAYMENT RECEIPT
# ============================================================================

class PaymentReceipt(TimestampedModel):
    """Generated receipt for a payment."""

    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='receipt',
    )
    receipt_number = models.CharField(max_length=64, unique=True)
    file = models.FileField(upload_to='srf/receipts/%Y/%m/')
    issued_at = models.DateTimeField(auto_now_add=True, db_index=True)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='issued_receipts',
    )
    sha256_hash = models.CharField(max_length=64, blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['-issued_at']

    def __str__(self) -> str:
        return f'Receipt<{self.receipt_number}>'


# ============================================================================
# 7. FINANCIAL HOLD
# ============================================================================

class FinancialHold(TimestampedModel):
    """Block placed on student services pending financial resolution."""

    class HoldType(models.TextChoices):
        PAYMENT = 'PAYMENT', _('Payment hold')
        DOCUMENT = 'DOCUMENT', _('Document issuance hold')
        GRADE = 'GRADE', _('Grade release hold')
        REGISTRATION = 'REGISTRATION', _('Registration hold')
        OTHER = 'OTHER', _('Other')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='financial_holds',
    )
    hold_type = models.CharField(
        max_length=16,
        choices=HoldType.choices,
        db_index=True,
    )
    reason = models.TextField()
    amount_threshold = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        help_text=_('Optional minimum unpaid amount that triggers this hold.'),
    )
    placed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='placed_holds',
    )
    placed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    released_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='released_holds',
    )
    released_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-placed_at']
        indexes = [
            models.Index(fields=['student_profile', 'is_active']),
            models.Index(fields=['hold_type', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'FinHold<{self.student_profile_id} {self.hold_type} active={self.is_active}>'


# ============================================================================
# 8. EXEMPTION AND ADJUSTMENT
# ============================================================================

class ExemptionAndAdjustment(TimestampedModel):
    """Discount, scholarship, exemption, or write-off applied to an account."""

    class AdjustmentType(models.TextChoices):
        SCHOLARSHIP = 'SCHOLARSHIP', _('Scholarship')
        EXEMPTION = 'EXEMPTION', _('Exemption')
        DISCOUNT = 'DISCOUNT', _('Discount')
        WRITE_OFF = 'WRITE_OFF', _('Write-off')
        ADJUSTMENT = 'ADJUSTMENT', _('Adjustment')

    account = models.ForeignKey(
        FinancialAccount,
        on_delete=models.CASCADE,
        related_name='adjustments',
    )
    adjustment_type = models.CharField(
        max_length=16,
        choices=AdjustmentType.choices,
        db_index=True,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='MAD')
    justification = models.TextField()
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_adjustments',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    effective_date = models.DateField(db_index=True)
    expires_at = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['account', 'is_active']),
            models.Index(fields=['adjustment_type', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'Adjustment<{self.account_id} {self.adjustment_type} {self.amount}>'


# ============================================================================
# 9. NOTIFICATION CAMPAIGN — bulk reminder dispatch
# ============================================================================

class NotificationCampaign(TimestampedModel):
    """
    Bulk financial communication campaign (overdue reminders, receipts,
    scholarship announcements...).

    Note: this is the SRF-app campaign artefact. Per-recipient delivery
    is handled by the canonical `notifications.NotificationRecipient`
    pipeline; this row tracks the campaign's metadata + counters.
    """

    class CampaignType(models.TextChoices):
        REMINDER = 'REMINDER', _('Reminder')
        OVERDUE = 'OVERDUE', _('Overdue notice')
        RECEIPT = 'RECEIPT', _('Receipt distribution')
        SCHOLARSHIP = 'SCHOLARSHIP', _('Scholarship announcement')
        GENERAL = 'GENERAL', _('General')

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', _('Email')
        SMS = 'SMS', _('SMS')
        IN_APP = 'IN_APP', _('In-app')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        RUNNING = 'RUNNING', _('Running')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    campaign_type = models.CharField(
        max_length=16,
        choices=CampaignType.choices,
        db_index=True,
    )
    channel = models.CharField(
        max_length=16,
        choices=Channel.choices,
        default=Channel.EMAIL,
    )
    target_filter_json = models.JSONField(default=dict, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_srf_campaigns',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-scheduled_at', '-created_at']
        indexes = [
            models.Index(fields=['campaign_type', 'status']),
            models.Index(fields=['status', 'scheduled_at']),
        ]

    def __str__(self) -> str:
        return f'NotifCampaign<{self.code} {self.status}>'


# ============================================================================
# 10. CASHFLOW SNAPSHOT
# ============================================================================

class CashflowSnapshot(models.Model):
    """Immutable point-in-time aggregate of financial state."""

    snapshot_date = models.DateField(unique=True, db_index=True)
    total_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_outstanding = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_overdue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    new_charges = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    adjustments_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default='MAD')
    breakdown_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-snapshot_date']

    def __str__(self) -> str:
        return f'Cashflow<{self.snapshot_date}>'
