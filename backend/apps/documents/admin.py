from django.contrib import admin

from .models import (
    AdministrativeResource,
    DocumentAttachment,
    DocumentOutput,
    DocumentRequest,
    DocumentRequestField,
    DocumentTemplate,
    DocumentType,
    DocumentTypeRule,
    DocumentWorkflow,
    Reservation,
    ReservationRule,
)


class DocumentTypeRuleInline(admin.TabularInline):
    model = DocumentTypeRule
    extra = 0
    fields = ('rule_code', 'description', 'is_active')


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'requires_workflow', 'is_active')
    list_filter = ('category', 'is_active', 'requires_workflow')
    search_fields = ('code', 'name', 'description')
    inlines = [DocumentTypeRuleInline]


@admin.register(DocumentTypeRule)
class DocumentTypeRuleAdmin(admin.ModelAdmin):
    list_display = ('document_type', 'rule_code', 'is_active')
    list_filter = ('is_active',)
    autocomplete_fields = ('document_type',)


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'document_type', 'language', 'is_default', 'is_active')
    list_filter = ('language', 'is_default', 'is_active')
    search_fields = ('code', 'name')
    autocomplete_fields = ('document_type',)


class DocumentRequestFieldInline(admin.TabularInline):
    model = DocumentRequestField
    extra = 0
    fields = ('field_name', 'field_label', 'field_type', 'is_validated')


class DocumentAttachmentInline(admin.TabularInline):
    model = DocumentAttachment
    extra = 0
    fields = ('attachment_type', 'file', 'original_filename', 'mime_type', 'uploaded_by')
    autocomplete_fields = ('uploaded_by',)


class DocumentWorkflowInline(admin.TabularInline):
    model = DocumentWorkflow
    extra = 0
    fields = ('step_code', 'step_label', 'status', 'decision', 'performed_by', 'performed_at')
    autocomplete_fields = ('performed_by',)


class DocumentOutputInline(admin.TabularInline):
    model = DocumentOutput
    extra = 0
    fields = ('format', 'file', 'sha256_hash', 'generated_at', 'is_signed', 'download_count')
    readonly_fields = ('sha256_hash', 'generated_at', 'download_count')


@admin.register(DocumentRequest)
class DocumentRequestAdmin(admin.ModelAdmin):
    list_display = (
        'document_type', 'requested_by', 'target_user', 'status', 'priority',
        'submitted_at', 'fulfilled_at',
    )
    list_filter = ('status', 'priority', 'document_type__category')
    search_fields = ('requested_by__email', 'target_user__email', 'reason')
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    autocomplete_fields = (
        'document_type', 'template', 'requested_by', 'target_user',
        'target_student_profile', 'reviewed_by',
    )
    inlines = [
        DocumentRequestFieldInline,
        DocumentAttachmentInline,
        DocumentWorkflowInline,
        DocumentOutputInline,
    ]
    date_hierarchy = 'created_at'


@admin.register(DocumentRequestField)
class DocumentRequestFieldAdmin(admin.ModelAdmin):
    list_display = ('document_request', 'field_name', 'field_type', 'is_validated')
    list_filter = ('field_type', 'is_validated')
    autocomplete_fields = ('document_request',)


@admin.register(DocumentAttachment)
class DocumentAttachmentAdmin(admin.ModelAdmin):
    list_display = ('document_request', 'attachment_type', 'original_filename', 'created_at')
    list_filter = ('attachment_type',)
    autocomplete_fields = ('document_request', 'uploaded_by')


@admin.register(DocumentWorkflow)
class DocumentWorkflowAdmin(admin.ModelAdmin):
    list_display = ('document_request', 'step_code', 'status', 'decision', 'performed_by', 'performed_at')
    list_filter = ('status', 'decision')
    autocomplete_fields = ('document_request', 'performed_by')


@admin.register(DocumentOutput)
class DocumentOutputAdmin(admin.ModelAdmin):
    list_display = ('document_request', 'format', 'is_signed', 'download_count', 'generated_at')
    list_filter = ('format', 'is_signed')
    autocomplete_fields = ('document_request', 'generated_by')


class ReservationRuleInline(admin.TabularInline):
    model = ReservationRule
    extra = 0
    fields = ('rule_type', 'description', 'is_active')


@admin.register(AdministrativeResource)
class AdministrativeResourceAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'resource_type', 'location', 'capacity', 'is_bookable', 'is_active')
    list_filter = ('resource_type', 'is_bookable', 'is_active')
    search_fields = ('code', 'name', 'location')
    inlines = [ReservationRuleInline]


@admin.register(ReservationRule)
class ReservationRuleAdmin(admin.ModelAdmin):
    list_display = ('resource', 'rule_type', 'is_active')
    list_filter = ('rule_type', 'is_active')
    autocomplete_fields = ('resource',)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource', 'reserved_by', 'start_at', 'end_at', 'status')
    list_filter = ('status', 'resource__resource_type')
    search_fields = ('title', 'purpose', 'reserved_by__email')
    readonly_fields = ('uuid',)
    autocomplete_fields = ('resource', 'reserved_by', 'reserved_for_user', 'approved_by')
    date_hierarchy = 'start_at'
