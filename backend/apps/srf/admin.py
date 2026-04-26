from django.contrib import admin

from .models import (
    CashflowSnapshot,
    ExemptionAndAdjustment,
    FeeType,
    FinancialAccount,
    FinancialHold,
    FinancialLine,
    NotificationCampaign,
    Payment,
    PaymentMethod,
    PaymentReceipt,
)


@admin.register(FeeType)
class FeeTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'default_amount', 'default_currency', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('code', 'name')


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'method_type', 'requires_reference', 'is_active')
    list_filter = ('method_type', 'is_active', 'requires_reference')
    search_fields = ('code', 'name')


class FinancialLineInline(admin.TabularInline):
    model = FinancialLine
    extra = 0
    fields = ('fee_type', 'line_type', 'amount', 'currency', 'due_date', 'status', 'paid_amount')
    autocomplete_fields = ('fee_type',)


@admin.register(FinancialAccount)
class FinancialAccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'student_profile', 'balance', 'currency', 'status', 'last_payment_at')
    list_filter = ('status', 'currency')
    search_fields = ('account_number', 'student_profile__user__email')
    autocomplete_fields = ('student_profile',)
    inlines = [FinancialLineInline]


@admin.register(FinancialLine)
class FinancialLineAdmin(admin.ModelAdmin):
    list_display = (
        'account', 'fee_type', 'line_type', 'amount', 'currency',
        'status', 'due_date', 'academic_year', 'paid_amount',
    )
    list_filter = ('line_type', 'status', 'academic_year')
    search_fields = ('account__account_number', 'description')
    autocomplete_fields = ('account', 'fee_type')
    date_hierarchy = 'due_date'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'account', 'payment_method', 'amount', 'currency',
        'status', 'payment_date', 'reference_number', 'recorded_by',
    )
    list_filter = ('status', 'payment_method', 'currency')
    search_fields = ('account__account_number', 'reference_number')
    readonly_fields = ('uuid',)
    autocomplete_fields = ('account', 'payment_method', 'recorded_by')
    date_hierarchy = 'payment_date'


@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'payment', 'issued_at', 'issued_by')
    search_fields = ('receipt_number',)
    autocomplete_fields = ('payment', 'issued_by')


@admin.register(FinancialHold)
class FinancialHoldAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'hold_type', 'is_active', 'placed_at', 'released_at', 'placed_by')
    list_filter = ('hold_type', 'is_active')
    search_fields = ('student_profile__user__email', 'reason')
    autocomplete_fields = ('student_profile', 'placed_by', 'released_by')


@admin.register(ExemptionAndAdjustment)
class ExemptionAndAdjustmentAdmin(admin.ModelAdmin):
    list_display = (
        'account', 'adjustment_type', 'amount', 'currency',
        'effective_date', 'expires_at', 'is_active', 'approved_by',
    )
    list_filter = ('adjustment_type', 'is_active', 'currency')
    search_fields = ('account__account_number', 'justification')
    autocomplete_fields = ('account', 'approved_by')
    date_hierarchy = 'effective_date'


@admin.register(NotificationCampaign)
class NotificationCampaignAdmin(admin.ModelAdmin):
    list_display = (
        'code', 'name', 'campaign_type', 'channel', 'status',
        'scheduled_at', 'sent_count', 'failed_count',
    )
    list_filter = ('campaign_type', 'channel', 'status')
    search_fields = ('code', 'name', 'description')
    autocomplete_fields = ('created_by',)


@admin.register(CashflowSnapshot)
class CashflowSnapshotAdmin(admin.ModelAdmin):
    list_display = (
        'snapshot_date', 'total_collected', 'total_outstanding',
        'total_overdue', 'new_charges', 'adjustments_total', 'currency',
    )
    list_filter = ('currency',)
    readonly_fields = ('created_at',)
    date_hierarchy = 'snapshot_date'
