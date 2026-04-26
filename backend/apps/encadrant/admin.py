from django.contrib import admin

from .models import (
    AgendaEvent,
    Meeting,
    Report,
    ReportVersion,
    SupervisedStudent,
    Task,
    Workspace,
)


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'workspace_type', 'owner_encadrant', 'status', 'start_date', 'end_date')
    list_filter = ('workspace_type', 'status')
    search_fields = ('code', 'name', 'description')
    autocomplete_fields = ('owner_encadrant',)


@admin.register(SupervisedStudent)
class SupervisedStudentAdmin(admin.ModelAdmin):
    list_display = ('encadrant_profile', 'student_profile', 'workspace', 'role', 'period_start', 'period_end', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('student_profile__user__email', 'encadrant_profile__supervisor_profile__user__email')
    autocomplete_fields = ('encadrant_profile', 'student_profile', 'workspace')


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'meeting_type', 'status', 'encadrant_profile', 'scheduled_at', 'duration_minutes')
    list_filter = ('meeting_type', 'status')
    search_fields = ('title', 'description', 'location')
    autocomplete_fields = ('encadrant_profile', 'workspace')
    filter_horizontal = ('students',)
    date_hierarchy = 'scheduled_at'


@admin.register(AgendaEvent)
class AgendaEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'encadrant_profile', 'start_at', 'end_at', 'all_day')
    list_filter = ('event_type', 'all_day')
    search_fields = ('title', 'description')
    autocomplete_fields = ('encadrant_profile', 'related_meeting', 'related_task')
    date_hierarchy = 'start_at'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace', 'assigned_to_student', 'status', 'priority', 'due_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'description')
    autocomplete_fields = ('workspace', 'assigned_to_student', 'assigned_by')
    date_hierarchy = 'due_at'


class ReportVersionInline(admin.TabularInline):
    model = ReportVersion
    extra = 0
    fields = ('version_number', 'change_note', 'created_by', 'created_at')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('created_by',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'report_type', 'status', 'student_profile',
        'encadrant_profile', 'period_start', 'period_end', 'score',
    )
    list_filter = ('report_type', 'status')
    search_fields = ('title', 'student_profile__user__email')
    autocomplete_fields = ('workspace', 'student_profile', 'encadrant_profile', 'reviewed_by')
    inlines = [ReportVersionInline]
    date_hierarchy = 'created_at'


@admin.register(ReportVersion)
class ReportVersionAdmin(admin.ModelAdmin):
    list_display = ('report', 'version_number', 'change_note', 'created_by', 'created_at')
    autocomplete_fields = ('report', 'created_by')
