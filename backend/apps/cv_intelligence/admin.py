from django.contrib import admin

from .models import CvIntelligenceReport, CvStructuredData


@admin.register(CvStructuredData)
class CvStructuredDataAdmin(admin.ModelAdmin):
    list_display = ('pk', 'student_profile', 'source_type', 'source_filename', 'created_at')
    search_fields = ('source_filename', 'student_profile__user__email')
    readonly_fields = ('uuid', 'created_at', 'updated_at')


@admin.register(CvIntelligenceReport)
class CvIntelligenceReportAdmin(admin.ModelAdmin):
    list_display = ('pk', 'student_profile', 'global_score', 'provider', 'source_type', 'analyzed_at')
    search_fields = ('student_profile__user__email', 'uuid')
    readonly_fields = ('uuid', 'analyzed_at', 'created_at', 'updated_at')
    list_filter = ('provider', 'source_type', 'status')
