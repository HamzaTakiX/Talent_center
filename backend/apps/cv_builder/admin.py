from django.contrib import admin

from .models import (
    CvAiAnalysis,
    CvAsset,
    CvSection,
    CvShareLink,
    CvTemplate,
    CvVersion,
    StudentCv,
)


@admin.register(CvTemplate)
class CvTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'is_active', 'is_default', 'updated_at')
    list_filter = ('category', 'is_active', 'is_default')
    search_fields = ('code', 'name')
    ordering = ('-is_default', 'category', 'name')


@admin.register(StudentCv)
class StudentCvAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'student_profile', 'template', 'is_primary', 'status', 'current_score', 'updated_at')
    list_filter = ('status', 'is_primary', 'template')
    search_fields = ('title', 'student_profile__user__email')
    raw_id_fields = ('student_profile', 'template')
    readonly_fields = ('uuid', 'created_at', 'updated_at', 'last_analyzed_at', 'last_exported_at')


@admin.register(CvSection)
class CvSectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_cv', 'section_type', 'label', 'order_index', 'is_visible', 'slot_name')
    list_filter = ('section_type', 'is_visible')
    search_fields = ('label', 'student_cv__title')
    raw_id_fields = ('student_cv',)
    ordering = ('student_cv', 'order_index')


@admin.register(CvAsset)
class CvAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_cv', 'asset_type', 'file', 'created_at')
    list_filter = ('asset_type',)
    raw_id_fields = ('student_cv',)


@admin.register(CvVersion)
class CvVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_cv', 'version_number', 'change_note', 'created_by', 'created_at')
    list_filter = ('student_cv',)
    raw_id_fields = ('student_cv', 'created_by')
    readonly_fields = ('snapshot_json', 'created_at', 'updated_at')


@admin.register(CvAiAnalysis)
class CvAiAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_cv', 'score', 'provider', 'analyzed_at')
    list_filter = ('provider',)
    raw_id_fields = ('student_cv',)
    readonly_fields = ('raw_response_json', 'suggestions_json', 'strengths_json', 'weaknesses_json',
                       'analyzed_at', 'created_at', 'updated_at')


@admin.register(CvShareLink)
class CvShareLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_cv', 'token', 'label', 'is_active',
                    'expires_at', 'view_count', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('token', 'label', 'student_cv__title')
    raw_id_fields = ('student_cv', 'created_by')
    readonly_fields = ('token', 'view_count', 'last_viewed_at', 'created_at', 'updated_at')
