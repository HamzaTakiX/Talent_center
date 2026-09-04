from django.contrib import admin

from .models import (
    AgendaEvent,
    Meeting,
    Report,
    ReportAttachment,
    ReportComment,
    ReportObligation,
    ReportTemplate,
    ReportVersion,
    ReportWorkflowEvent,
    SupervisedStudent,
    Task,
    Workspace,
    WorkspaceDocument,
    WorkspaceDocumentReview,
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
        'title', 'report_type', 'status', 'severity', 'priority_score',
        'is_overdue', 'student_profile', 'encadrant_profile', 'score',
    )
    list_filter = ('report_type', 'status', 'severity', 'is_overdue')
    search_fields = ('title', 'student_profile__user__email', 'company_name')
    autocomplete_fields = (
        'workspace', 'student_profile', 'encadrant_profile', 'reviewed_by',
        'assigned_reviewer', 'filiere',
    )
    raw_id_fields = ('internship_type',)
    inlines = [ReportVersionInline]
    date_hierarchy = 'created_at'


@admin.register(ReportAttachment)
class ReportAttachmentAdmin(admin.ModelAdmin):
    list_display = ('report', 'original_name', 'mime_type', 'size_bytes', 'created_at')


@admin.register(ReportWorkflowEvent)
class ReportWorkflowEventAdmin(admin.ModelAdmin):
    list_display = ('report', 'action', 'from_status', 'to_status', 'actor', 'created_at')
    list_filter = ('action',)


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    list_display = ('report', 'author', 'is_internal', 'created_at')


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'report_type', 'is_active')


@admin.register(ReportObligation)
class ReportObligationAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'encadrant_profile', 'report_type', 'due_at', 'status')
    list_filter = ('status', 'report_type')


@admin.register(ReportVersion)
class ReportVersionAdmin(admin.ModelAdmin):
    list_display = ('report', 'version_number', 'change_note', 'created_by', 'created_at')
    autocomplete_fields = ('report', 'created_by')


@admin.register(WorkspaceDocument)
class WorkspaceDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'original_name', 'student_profile', 'category', 'size_bytes',
        'viewed_by_encadrant_at', 'created_at',
    )
    list_filter = ('category',)
    search_fields = ('original_name', 'student_profile__user__email')
    autocomplete_fields = ('student_profile', 'encadrant_profile', 'uploaded_by')


@admin.register(WorkspaceDocumentReview)
class WorkspaceDocumentReviewAdmin(admin.ModelAdmin):
    list_display = ('document', 'grade', 'status', 'author', 'updated_at')
    list_filter = ('status',)
    search_fields = ('comment', 'grade', 'document__original_name')
    autocomplete_fields = ('document', 'author')
