"""
Agenda / Calendar domain models.

Design contract
---------------
* This app owns the *calendar*. It does not own meetings, chat, notifications
  or documents — every business object is referenced by FK:
  ``encadrant.Meeting`` supplies video conferencing, ``chat.Conversation``
  supplies discussion, ``admin_management.Assignment`` supplies the
  student ↔ encadrant internship context.
* ``encadrant.AgendaEvent`` predates this app. It is encadrant-only, has no
  API surface and no participants/recurrence/reminders, so it cannot back a
  cross-role calendar. It is left untouched; ``CalendarEvent`` supersedes it.
* All datetimes are stored timezone-aware in UTC (``USE_TZ = True``). The
  ``timezone`` column records the IANA zone the event was authored in, which
  is what recurrence expansion and all-day rendering are anchored to.
* A recurring event is ONE row plus an ``EventRecurrence`` rule. Occurrences
  are expanded on read. Single-occurrence edits become detached child rows
  (``recurrence_parent``) and single-occurrence cancellations become
  ``EventRecurrenceException`` rows — the Google Calendar model.
"""

from __future__ import annotations

import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import F, Q, UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel

from .constants import DEFAULT_TIMEZONE


class EventType(models.TextChoices):
    """Talent Center business categories, aligned with the agenda UI legend."""

    MEETING = 'MEETING', _('Meeting')
    DEADLINE = 'DEADLINE', _('Deadline')
    EVALUATION = 'EVALUATION', _('Evaluation')
    MILESTONE = 'MILESTONE', _('Internship milestone')
    ADMINISTRATIVE = 'ADMINISTRATIVE', _('Administrative')
    FINANCE = 'FINANCE', _('SRF / Finance')
    REMINDER = 'REMINDER', _('Reminder')
    OUT_OF_OFFICE = 'OUT_OF_OFFICE', _('Out of office')
    OTHER = 'OTHER', _('Other')


class EventStatus(models.TextChoices):
    CONFIRMED = 'CONFIRMED', _('Confirmed')
    TENTATIVE = 'TENTATIVE', _('Tentative')
    CANCELLED = 'CANCELLED', _('Cancelled')
    COMPLETED = 'COMPLETED', _('Completed')


class EventVisibility(models.TextChoices):
    """Who may read the event, beyond the organizer."""

    PRIVATE = 'PRIVATE', _('Private — organizer only')
    PARTICIPANTS = 'PARTICIPANTS', _('Participants only')
    SUPERVISION = 'SUPERVISION', _('Participants, supervising encadrant and admins')


class EventPriority(models.TextChoices):
    LOW = 'LOW', _('Low')
    MEDIUM = 'MEDIUM', _('Medium')
    HIGH = 'HIGH', _('High')
    URGENT = 'URGENT', _('Urgent')


class EventSource(models.TextChoices):
    """Where the row came from, which decides how much of it is editable."""

    NATIVE = 'NATIVE', _('Created in the calendar')
    MEETING = 'MEETING', _('Projected from a supervision meeting')


class CalendarEvent(TimestampedModel):
    """A single calendar entry, or the master row of a recurring series."""

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.MEETING,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=EventStatus.choices,
        default=EventStatus.CONFIRMED,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=EventPriority.choices,
        default=EventPriority.MEDIUM,
    )
    visibility = models.CharField(
        max_length=16,
        choices=EventVisibility.choices,
        default=EventVisibility.PARTICIPANTS,
        db_index=True,
    )
    source = models.CharField(
        max_length=16,
        choices=EventSource.choices,
        default=EventSource.NATIVE,
        db_index=True,
    )

    # ---- Scheduling (stored UTC; `timezone` is the authoring zone) ----
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(db_index=True)
    timezone = models.CharField(
        max_length=64,
        default=DEFAULT_TIMEZONE,
        help_text=_('IANA zone the event was authored in, e.g. Africa/Casablanca.'),
    )
    all_day = models.BooleanField(default=False)

    location = models.CharField(max_length=255, blank=True, default='')

    # ---- Conferencing: reuses the existing Jitsi-backed supervision meeting ----
    is_online = models.BooleanField(default=False, db_index=True)
    meeting = models.ForeignKey(
        'encadrant.Meeting',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
        help_text=_('Existing supervision meeting supplying the video room.'),
    )
    external_meeting_url = models.URLField(max_length=512, blank=True, default='')

    # ---- Ownership ----
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_calendar_events',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_calendar_events',
    )

    # ---- Talent Center business context ----
    related_student = models.ForeignKey(
        StudentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_encadrant = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_assignment = models.ForeignKey(
        'admin_management.Assignment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
        help_text=_('Internship / supervision assignment this event belongs to.'),
    )
    related_application = models.ForeignKey(
        'stage.OfferApplication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_report = models.ForeignKey(
        'encadrant.Report',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_task = models.ForeignKey(
        'encadrant.Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    related_document_request = models.ForeignKey(
        'documents.DocumentRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
    )
    conversation = models.ForeignKey(
        'chat.Conversation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='calendar_events',
        help_text=_('Existing chat thread for this event — never created in duplicate.'),
    )

    # ---- Recurrence: detached override of one occurrence of `recurrence_parent` ----
    recurrence_parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recurrence_overrides',
    )
    recurrence_original_start = models.DateTimeField(null=True, blank=True, db_index=True)

    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['start_at', 'pk']
        indexes = [
            models.Index(fields=['organizer', 'start_at']),
            models.Index(fields=['start_at', 'end_at']),
            models.Index(fields=['event_type', 'start_at']),
            models.Index(fields=['status', 'start_at']),
            models.Index(fields=['related_student', 'start_at']),
            models.Index(fields=['related_encadrant', 'start_at']),
            models.Index(fields=['related_assignment', 'start_at']),
            models.Index(fields=['recurrence_parent', 'recurrence_original_start']),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(end_at__gte=F('start_at')),
                name='agenda_event_end_after_start',
            ),
            # A detached override is identified by (series, original occurrence).
            UniqueConstraint(
                fields=['recurrence_parent', 'recurrence_original_start'],
                condition=Q(recurrence_parent__isnull=False),
                name='uniq_agenda_recurrence_override',
            ),
        ]

    def __str__(self) -> str:
        return f'CalendarEvent<{self.title} {self.start_at:%Y-%m-%d %H:%M}>'

    @property
    def is_series_master(self) -> bool:
        return hasattr(self, 'recurrence') and self.recurrence is not None

    @property
    def duration(self):
        return self.end_at - self.start_at


class EventParticipant(TimestampedModel):
    """Attendee of an event. The organizer is stored here too, with role ORGANIZER."""

    class Role(models.TextChoices):
        ORGANIZER = 'ORGANIZER', _('Organizer')
        REQUIRED = 'REQUIRED', _('Required attendee')
        OPTIONAL = 'OPTIONAL', _('Optional attendee')

    class Response(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACCEPTED = 'ACCEPTED', _('Accepted')
        DECLINED = 'DECLINED', _('Declined')
        TENTATIVE = 'TENTATIVE', _('Tentative')

    event = models.ForeignKey(
        CalendarEvent,
        on_delete=models.CASCADE,
        related_name='participants',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='calendar_participations',
    )
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.REQUIRED)
    response = models.CharField(
        max_length=16,
        choices=Response.choices,
        default=Response.PENDING,
        db_index=True,
    )
    responded_at = models.DateTimeField(null=True, blank=True)
    comment = models.CharField(max_length=255, blank=True, default='')
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['role', 'pk']
        constraints = [
            UniqueConstraint(fields=['event', 'user'], name='uniq_agenda_participant_per_event'),
        ]
        indexes = [
            models.Index(fields=['user', 'response']),
            models.Index(fields=['event', 'role']),
        ]

    def __str__(self) -> str:
        return f'EventParticipant<{self.event_id}:{self.user_id} {self.response}>'


class EventRecurrence(TimestampedModel):
    """Recurrence rule for a series master. Expanded with dateutil.rrule on read."""

    class Frequency(models.TextChoices):
        DAILY = 'DAILY', _('Daily')
        WEEKLY = 'WEEKLY', _('Weekly')
        MONTHLY = 'MONTHLY', _('Monthly')
        YEARLY = 'YEARLY', _('Yearly')

    event = models.OneToOneField(
        CalendarEvent,
        on_delete=models.CASCADE,
        related_name='recurrence',
    )
    frequency = models.CharField(max_length=12, choices=Frequency.choices, default=Frequency.WEEKLY)
    interval = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
    )
    by_weekdays = models.JSONField(
        default=list,
        blank=True,
        help_text=_('WEEKLY only. ISO-style indexes with Monday = 0.'),
    )
    by_month_day = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text=_('MONTHLY / YEARLY only. Defaults to the master start day.'),
    )
    until_at = models.DateTimeField(null=True, blank=True)
    count = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(500)],
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            models.CheckConstraint(
                check=Q(until_at__isnull=True) | Q(count__isnull=True),
                name='agenda_recurrence_until_xor_count',
            ),
        ]

    def __str__(self) -> str:
        return f'EventRecurrence<{self.event_id} {self.frequency}/{self.interval}>'


class EventRecurrenceException(models.Model):
    """A single occurrence of a series that was deleted or detached."""

    series = models.ForeignKey(
        CalendarEvent,
        on_delete=models.CASCADE,
        related_name='recurrence_exceptions',
    )
    occurrence_start = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['occurrence_start']
        constraints = [
            UniqueConstraint(
                fields=['series', 'occurrence_start'],
                name='uniq_agenda_recurrence_exception',
            ),
        ]
        indexes = [models.Index(fields=['series', 'occurrence_start'])]

    def __str__(self) -> str:
        return f'EventRecurrenceException<{self.series_id}@{self.occurrence_start:%Y-%m-%dT%H:%M}>'


class EventReminder(TimestampedModel):
    """Reminder rule. `user = NULL` means every participant of the event."""

    class Channel(models.TextChoices):
        IN_APP = 'IN_APP', _('In-app')
        EMAIL = 'EMAIL', _('Email')

    event = models.ForeignKey(
        CalendarEvent,
        on_delete=models.CASCADE,
        related_name='reminders',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='calendar_reminders',
    )
    minutes_before = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(60 * 24 * 30)],
    )
    channel = models.CharField(max_length=12, choices=Channel.choices, default=Channel.IN_APP)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['minutes_before']
        constraints = [
            UniqueConstraint(
                fields=['event', 'user', 'minutes_before', 'channel'],
                name='uniq_agenda_reminder_per_user',
            ),
        ]
        indexes = [models.Index(fields=['event', 'is_active'])]

    def __str__(self) -> str:
        return f'EventReminder<{self.event_id} -{self.minutes_before}m {self.channel}>'


class EventReminderDispatch(models.Model):
    """
    Idempotency ledger for fired reminders.

    Keyed by occurrence so a recurring series fires once per occurrence rather
    than once per rule.
    """

    reminder = models.ForeignKey(
        EventReminder,
        on_delete=models.CASCADE,
        related_name='dispatches',
    )
    occurrence_start = models.DateTimeField(db_index=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']
        constraints = [
            UniqueConstraint(
                fields=['reminder', 'occurrence_start'],
                name='uniq_agenda_reminder_dispatch',
            ),
        ]

    def __str__(self) -> str:
        return f'EventReminderDispatch<{self.reminder_id}@{self.occurrence_start:%Y-%m-%dT%H:%M}>'


class AvailabilityRule(TimestampedModel):
    """Recurring weekly working hours, expressed in the user's own zone."""

    class Weekday(models.IntegerChoices):
        MONDAY = 0, _('Monday')
        TUESDAY = 1, _('Tuesday')
        WEDNESDAY = 2, _('Wednesday')
        THURSDAY = 3, _('Thursday')
        FRIDAY = 4, _('Friday')
        SATURDAY = 5, _('Saturday')
        SUNDAY = 6, _('Sunday')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availability_rules',
    )
    weekday = models.PositiveSmallIntegerField(choices=Weekday.choices, db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=64, default=DEFAULT_TIMEZONE)
    is_active = models.BooleanField(default=True, db_index=True)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['weekday', 'start_time']
        constraints = [
            models.CheckConstraint(
                check=Q(end_time__gt=F('start_time')),
                name='agenda_availability_end_after_start',
            ),
            UniqueConstraint(
                fields=['user', 'weekday', 'start_time', 'end_time'],
                name='uniq_agenda_availability_window',
            ),
        ]
        indexes = [models.Index(fields=['user', 'is_active'])]

    def __str__(self) -> str:
        return f'AvailabilityRule<{self.user_id} {self.weekday} {self.start_time}-{self.end_time}>'


class AvailabilityException(TimestampedModel):
    """
    One-off override of the weekly rules.

    ``is_available=False`` blocks a period (holiday, out of office);
    ``is_available=True`` opens a period outside normal working hours.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availability_exceptions',
    )
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(db_index=True)
    is_available = models.BooleanField(default=False)
    reason = models.CharField(max_length=255, blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['start_at']
        constraints = [
            models.CheckConstraint(
                check=Q(end_at__gt=F('start_at')),
                name='agenda_availability_exception_end_after_start',
            ),
        ]
        indexes = [models.Index(fields=['user', 'start_at'])]

    def __str__(self) -> str:
        return f'AvailabilityException<{self.user_id} {self.start_at:%Y-%m-%d}>'
