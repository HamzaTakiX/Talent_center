from django.contrib import admin

from .models import (
    AvailabilityException,
    AvailabilityRule,
    CalendarEvent,
    EventParticipant,
    EventRecurrence,
    EventRecurrenceException,
    EventReminder,
)


class EventParticipantInline(admin.TabularInline):
    model = EventParticipant
    extra = 0
    autocomplete_fields = ['user']


class EventReminderInline(admin.TabularInline):
    model = EventReminder
    extra = 0


class EventRecurrenceInline(admin.StackedInline):
    model = EventRecurrence
    extra = 0


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'status', 'start_at', 'end_at', 'organizer', 'source')
    list_filter = ('event_type', 'status', 'visibility', 'source', 'all_day', 'is_online')
    search_fields = ('title', 'description', 'organizer__email', 'uuid')
    date_hierarchy = 'start_at'
    raw_id_fields = (
        'organizer', 'created_by', 'cancelled_by', 'related_student', 'related_encadrant',
        'related_assignment', 'related_application', 'related_offer', 'related_report',
        'related_task', 'related_document_request', 'meeting', 'conversation',
        'recurrence_parent',
    )
    inlines = [EventRecurrenceInline, EventParticipantInline, EventReminderInline]


@admin.register(EventRecurrenceException)
class EventRecurrenceExceptionAdmin(admin.ModelAdmin):
    list_display = ('series', 'occurrence_start', 'created_at')
    raw_id_fields = ('series',)


@admin.register(AvailabilityRule)
class AvailabilityRuleAdmin(admin.ModelAdmin):
    list_display = ('user', 'weekday', 'start_time', 'end_time', 'timezone', 'is_active')
    list_filter = ('weekday', 'is_active')
    raw_id_fields = ('user',)


@admin.register(AvailabilityException)
class AvailabilityExceptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'start_at', 'end_at', 'is_available', 'reason')
    list_filter = ('is_available',)
    raw_id_fields = ('user',)
