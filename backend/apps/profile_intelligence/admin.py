from django.contrib import admin

from .models import (
    StudentProfileActivityLog,
    StudentProfileBehaviorMetric,
    StudentProfileContext,
    StudentProfileIndicator,
    StudentProfileModuleData,
    StudentProfileModuleRegistry,
    StudentProfileQueryLog,
    StudentProfileRisk,
    StudentProfileSnapshot,
    StudentProfileStateTransition,
    StudentProfileSuggestion,
)


@admin.register(StudentProfileIndicator)
class StudentProfileIndicatorAdmin(admin.ModelAdmin):
    list_display = (
        'student_profile', 'health_score', 'engagement_score',
        'risk_score', 'is_at_risk', 'updated_at',
    )
    list_filter = ('is_at_risk',)
    search_fields = ('student_profile__user__email',)


@admin.register(StudentProfileActivityLog)
class StudentProfileActivityLogAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'activity_type', 'source_app', 'action_code', 'created_at')
    list_filter = ('activity_type', 'source_app')
    search_fields = ('student_profile__user__email', 'action_code')


@admin.register(StudentProfileBehaviorMetric)
class StudentProfileBehaviorMetricAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'source_app', 'login_count', 'actions_count', 'engagement_level')
    list_filter = ('source_app', 'engagement_level')


@admin.register(StudentProfileContext)
class StudentProfileContextAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'context_code', 'source_app', 'status', 'updated_at')
    list_filter = ('source_app', 'status')


@admin.register(StudentProfileModuleRegistry)
class StudentProfileModuleRegistryAdmin(admin.ModelAdmin):
    list_display = ('module_code', 'module_name', 'source_app', 'is_active')
    list_filter = ('is_active', 'source_app')


@admin.register(StudentProfileModuleData)
class StudentProfileModuleDataAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'module', 'last_updated_at')


@admin.register(StudentProfileSuggestion)
class StudentProfileSuggestionAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'title', 'suggestion_type', 'priority', 'is_completed')
    list_filter = ('suggestion_type', 'priority', 'is_completed')


@admin.register(StudentProfileRisk)
class StudentProfileRiskAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'risk_type', 'risk_level', 'is_active', 'updated_at')
    list_filter = ('risk_level', 'is_active', 'risk_type')


@admin.register(StudentProfileStateTransition)
class StudentProfileStateTransitionAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'from_state', 'to_state', 'trigger_type', 'transitioned_at')
    list_filter = ('to_state', 'trigger_type')


@admin.register(StudentProfileQueryLog)
class StudentProfileQueryLogAdmin(admin.ModelAdmin):
    list_display = ('query_type', 'executed_by', 'result_count', 'created_at')
    list_filter = ('query_type',)


@admin.register(StudentProfileSnapshot)
class StudentProfileSnapshotAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'snapshot_date', 'completion_rate', 'engagement_score', 'risk_score')
    list_filter = ('snapshot_date',)
