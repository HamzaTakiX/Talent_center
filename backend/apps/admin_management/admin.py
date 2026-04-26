from django.contrib import admin

from .models import (
    AdminProfile,
    AdminRoleAssignment,
    Assignment,
    ClassGroup,
    EncadrantProfile,
    Filiere,
    ImportLog,
)


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'is_active', 'updated_at')
    list_filter = ('is_active', 'department')
    search_fields = ('code', 'name', 'department')


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'filiere', 'academic_year', 'level', 'student_capacity', 'is_active')
    list_filter = ('academic_year', 'level', 'is_active', 'filiere')
    search_fields = ('code', 'name')
    autocomplete_fields = ('filiere',)


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'admin_level', 'is_active', 'last_admin_login_at', 'updated_at')
    list_filter = ('admin_level', 'is_active')
    search_fields = ('user__email',)
    autocomplete_fields = ('user',)


@admin.register(EncadrantProfile)
class EncadrantProfileAdmin(admin.ModelAdmin):
    list_display = ('supervisor_profile', 'current_workload', 'max_concurrent_students', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('supervisor_profile__user__email',)
    autocomplete_fields = ('supervisor_profile',)


@admin.register(AdminRoleAssignment)
class AdminRoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('target_user', 'role', 'filiere', 'class_group', 'is_active', 'granted_at', 'expires_at')
    list_filter = ('is_active', 'role', 'filiere')
    search_fields = ('target_user__email', 'role__code')
    autocomplete_fields = ('target_user', 'role', 'filiere', 'class_group', 'access_scope', 'granted_by')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'class_group', 'encadrant_profile', 'academic_year', 'is_active')
    list_filter = ('academic_year', 'is_active', 'class_group')
    search_fields = ('student_profile__user__email',)
    autocomplete_fields = ('student_profile', 'class_group', 'encadrant_profile', 'assigned_by')


@admin.register(ImportLog)
class ImportLogAdmin(admin.ModelAdmin):
    list_display = ('import_type', 'status', 'source_filename', 'success_rows', 'error_rows', 'total_rows', 'created_at')
    list_filter = ('import_type', 'status')
    search_fields = ('source_filename', 'started_by__email')
    readonly_fields = ('errors_json', 'summary_json', 'started_at', 'completed_at')
