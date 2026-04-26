from django.contrib import admin

from .models import (
    ApplicationDocument,
    CandidateCollection,
    CandidateCollectionItem,
    ExternalLinkFollowup,
    InternshipOffer,
    OfferApplication,
    OfferTargetingRule,
    StudentOfferMatchScore,
)


class OfferTargetingRuleInline(admin.TabularInline):
    model = OfferTargetingRule
    extra = 0
    fields = ('rule_type', 'is_inclusive', 'priority', 'is_active')


@admin.register(InternshipOffer)
class InternshipOfferAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'company_name', 'offer_type', 'status',
        'location_city', 'is_remote', 'application_deadline',
        'application_count', 'view_count', 'published_at',
    )
    list_filter = ('status', 'offer_type', 'is_remote', 'is_hybrid', 'min_education_level')
    search_fields = ('title', 'company_name', 'location_city', 'external_source')
    readonly_fields = ('uuid', 'view_count', 'application_count', 'created_at', 'updated_at')
    autocomplete_fields = ('posted_by',)
    inlines = [OfferTargetingRuleInline]
    date_hierarchy = 'published_at'


@admin.register(OfferTargetingRule)
class OfferTargetingRuleAdmin(admin.ModelAdmin):
    list_display = ('offer', 'rule_type', 'is_inclusive', 'priority', 'is_active')
    list_filter = ('rule_type', 'is_inclusive', 'is_active')
    autocomplete_fields = ('offer',)


@admin.register(StudentOfferMatchScore)
class StudentOfferMatchScoreAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'offer', 'score', 'is_recommended', 'computed_at')
    list_filter = ('is_recommended',)
    search_fields = ('student_profile__user__email', 'offer__title')
    autocomplete_fields = ('student_profile', 'offer')


class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 0
    fields = ('document_type', 'file', 'original_filename', 'file_size_bytes')
    readonly_fields = ('file_size_bytes',)


@admin.register(OfferApplication)
class OfferApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'student_profile', 'offer', 'status', 'applied_at',
        'match_score_at_apply', 'reviewed_by', 'last_status_change_at',
    )
    list_filter = ('status', 'offer__offer_type')
    search_fields = ('student_profile__user__email', 'offer__title', 'offer__company_name')
    readonly_fields = ('uuid', 'applied_at', 'last_status_change_at')
    autocomplete_fields = ('offer', 'student_profile', 'student_cv', 'reviewed_by')
    raw_id_fields = ('cv_analysis',)
    inlines = [ApplicationDocumentInline]
    date_hierarchy = 'applied_at'


@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ('application', 'document_type', 'original_filename', 'file_size_bytes', 'created_at')
    list_filter = ('document_type',)
    autocomplete_fields = ('application',)


class CandidateCollectionItemInline(admin.TabularInline):
    model = CandidateCollectionItem
    extra = 0
    fields = ('student_profile', 'priority', 'notes', 'added_by', 'added_at')
    readonly_fields = ('added_at',)
    autocomplete_fields = ('student_profile', 'added_by')


@admin.register(CandidateCollection)
class CandidateCollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_shared', 'updated_at')
    list_filter = ('is_shared',)
    search_fields = ('name', 'owner__email')
    autocomplete_fields = ('owner',)
    inlines = [CandidateCollectionItemInline]


@admin.register(CandidateCollectionItem)
class CandidateCollectionItemAdmin(admin.ModelAdmin):
    list_display = ('collection', 'student_profile', 'priority', 'added_at')
    autocomplete_fields = ('collection', 'student_profile', 'added_by')


@admin.register(ExternalLinkFollowup)
class ExternalLinkFollowupAdmin(admin.ModelAdmin):
    list_display = ('offer', 'student_profile', 'event_type', 'target_url', 'created_at')
    list_filter = ('event_type',)
    search_fields = ('offer__title', 'target_url')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('offer', 'student_profile')
    date_hierarchy = 'created_at'
