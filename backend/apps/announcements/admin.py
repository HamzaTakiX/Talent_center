from django.contrib import admin

from .models import (
    Announcement,
    AnnouncementAttachment,
    AnnouncementOfferLink,
    AnnouncementTarget,
    AnnouncementType,
    RecommendationScore,
    StudentAnnouncementAction,
    StudentAnnouncementPreference,
)


@admin.register(AnnouncementType)
class AnnouncementTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'default_priority', 'is_active', 'is_system')
    list_filter = ('is_active', 'is_system', 'default_priority')
    search_fields = ('code', 'name', 'description')


class AnnouncementTargetInline(admin.TabularInline):
    model = AnnouncementTarget
    extra = 0
    fields = ('target_type', 'filiere', 'class_group', 'role', 'target_user', 'is_inclusive')
    autocomplete_fields = ('filiere', 'class_group', 'role', 'target_user')


class AnnouncementAttachmentInline(admin.TabularInline):
    model = AnnouncementAttachment
    extra = 0
    fields = ('file', 'original_filename', 'file_size_bytes', 'mime_type')
    readonly_fields = ('file_size_bytes',)


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'announcement_type', 'priority', 'status',
        'is_pinned', 'published_at', 'view_count',
    )
    list_filter = ('status', 'priority', 'is_pinned', 'announcement_type')
    search_fields = ('title', 'body', 'summary')
    readonly_fields = ('uuid', 'view_count', 'created_at', 'updated_at')
    autocomplete_fields = ('announcement_type', 'posted_by')
    inlines = [AnnouncementTargetInline, AnnouncementAttachmentInline]
    date_hierarchy = 'published_at'


@admin.register(AnnouncementTarget)
class AnnouncementTargetAdmin(admin.ModelAdmin):
    list_display = ('announcement', 'target_type', 'filiere', 'class_group', 'role', 'target_user', 'is_inclusive')
    list_filter = ('target_type', 'is_inclusive')
    autocomplete_fields = ('announcement', 'filiere', 'class_group', 'role', 'target_user')


@admin.register(AnnouncementAttachment)
class AnnouncementAttachmentAdmin(admin.ModelAdmin):
    list_display = ('announcement', 'original_filename', 'mime_type', 'file_size_bytes', 'created_at')
    autocomplete_fields = ('announcement',)


@admin.register(AnnouncementOfferLink)
class AnnouncementOfferLinkAdmin(admin.ModelAdmin):
    list_display = ('announcement', 'offer', 'created_at')
    autocomplete_fields = ('announcement', 'offer')


@admin.register(StudentAnnouncementAction)
class StudentAnnouncementActionAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'announcement', 'action_type', 'created_at')
    list_filter = ('action_type',)
    search_fields = ('student_profile__user__email', 'announcement__title')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('student_profile', 'announcement')
    date_hierarchy = 'created_at'


@admin.register(RecommendationScore)
class RecommendationScoreAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'announcement', 'score', 'is_recommended', 'computed_at')
    list_filter = ('is_recommended',)
    search_fields = ('student_profile__user__email', 'announcement__title')
    autocomplete_fields = ('student_profile', 'announcement')


@admin.register(StudentAnnouncementPreference)
class StudentAnnouncementPreferenceAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'announcement_type', 'notify_via_email', 'notify_via_in_app', 'is_muted')
    list_filter = ('is_muted', 'notify_via_email', 'notify_via_in_app')
    search_fields = ('student_profile__user__email',)
    autocomplete_fields = ('student_profile', 'announcement_type')
