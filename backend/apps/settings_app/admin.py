from django.contrib import admin

from .models import (
    AppSettingsRegistry,
    GeneralSettings,
    SecuritySettings,
    UserAppSettings,
)


@admin.register(AppSettingsRegistry)
class AppSettingsRegistryAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'category', 'value_type', 'is_user_configurable', 'is_system')
    list_filter = ('category', 'value_type', 'is_user_configurable', 'is_system')
    search_fields = ('key', 'name', 'description')


@admin.register(UserAppSettings)
class UserAppSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'setting', 'updated_at')
    search_fields = ('user__email', 'setting__key')
    autocomplete_fields = ('user', 'setting')


@admin.register(GeneralSettings)
class GeneralSettingsAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_by', 'updated_at')
    search_fields = ('key', 'description')


@admin.register(SecuritySettings)
class SecuritySettingsAdmin(admin.ModelAdmin):
    list_display = ('key', 'requires_2fa_to_change', 'updated_by', 'updated_at')
    search_fields = ('key', 'description')
