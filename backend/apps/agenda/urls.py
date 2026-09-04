"""Calendar routes, mounted at /api/agenda/ by core.urls."""

from django.urls import path

from .views import (
    CalendarConflictCheckView,
    CalendarContactsView,
    CalendarEventDetailView,
    CalendarEventJoinView,
    CalendarEventListCreateView,
    CalendarEventMoveView,
    CalendarEventParticipantsView,
    CalendarEventRespondView,
    CalendarMetadataView,
)
from .views_availability import (
    AvailabilityExceptionsView,
    AvailabilityRulesView,
    FreeBusyView,
    SuggestedSlotsView,
)

urlpatterns = [
    path('meta', CalendarMetadataView.as_view(), name='agenda-meta'),
    path('contacts', CalendarContactsView.as_view(), name='agenda-contacts'),
    path('conflicts', CalendarConflictCheckView.as_view(), name='agenda-conflicts'),

    path('events', CalendarEventListCreateView.as_view(), name='agenda-events'),
    path('events/<uuid:event_uuid>', CalendarEventDetailView.as_view(), name='agenda-event-detail'),
    path('events/<uuid:event_uuid>/move', CalendarEventMoveView.as_view(), name='agenda-event-move'),
    path(
        'events/<uuid:event_uuid>/participants',
        CalendarEventParticipantsView.as_view(),
        name='agenda-event-participants',
    ),
    path(
        'events/<uuid:event_uuid>/respond',
        CalendarEventRespondView.as_view(),
        name='agenda-event-respond',
    ),
    path('events/<uuid:event_uuid>/join', CalendarEventJoinView.as_view(), name='agenda-event-join'),

    path('availability', AvailabilityRulesView.as_view(), name='agenda-availability'),
    path('availability/exceptions', AvailabilityExceptionsView.as_view(), name='agenda-availability-exceptions'),
    path(
        'availability/exceptions/<int:exception_id>',
        AvailabilityExceptionsView.as_view(),
        name='agenda-availability-exception-detail',
    ),
    path('availability/free-busy', FreeBusyView.as_view(), name='agenda-free-busy'),
    path('availability/slots', SuggestedSlotsView.as_view(), name='agenda-slots'),
]
