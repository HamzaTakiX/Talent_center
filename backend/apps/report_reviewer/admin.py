from django.contrib import admin

from .models import PageAnalysisCache


@admin.register(PageAnalysisCache)
class PageAnalysisCacheAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'page_number', 'mode', 'score', 'user', 'updated_at', 'model_name')
    list_filter = ('mode',)
    search_fields = ('report_id', 'content_hash', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
