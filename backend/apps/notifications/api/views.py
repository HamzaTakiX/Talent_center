"""Notification API views."""

from __future__ import annotations

from datetime import datetime

from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.notifications.api.serializers import (
    NotificationPreferenceSerializer,
    NotificationPreferenceUpdateSerializer,
    NotificationSerializer,
)
from apps.notifications.constants import Category, Priority
from apps.notifications.models import Notification, NotificationPreference, NotificationRecipient
from apps.notifications.services.display_service import requires_action
from apps.notifications.services.history_bridge import (
    record_notification_archived,
    record_notification_clicked,
    record_notification_read,
)
from apps.notifications.services.realtime import push_notification_read, push_unread_count
from apps.notifications.events.matrix import event_codes_for_category


def _parse_datetime_param(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = parse_datetime(value)
    if parsed and timezone.is_naive(parsed):
        return timezone.make_aware(parsed)
    return parsed


def _build_feed_queryset(user, params):
    section = params.get('section', 'all')
    if section == 'archived':
        qs = Notification.objects.filter(recipient=user, is_archived=True)
    elif section == 'read':
        qs = Notification.objects.filter(recipient=user, is_read=True, is_archived=False)
    elif section == 'unread':
        qs = Notification.objects.filter(recipient=user, is_read=False, is_archived=False)
    else:
        qs = Notification.objects.filter(recipient=user, is_archived=False)

    if params.get('unread') == 'true':
        qs = qs.filter(is_read=False)

    category = params.get('category')
    if category:
        codes = event_codes_for_category(category)
        if codes:
            qs = qs.filter(Q(notification_type__in=codes) | Q(event__event_code__in=codes))

    priority = params.get('priority')
    if priority in Priority.values:
        qs = qs.filter(event__priority=priority)

    notification_type = params.get('type') or params.get('notification_type')
    if notification_type:
        qs = qs.filter(notification_type=notification_type)

    source_module = params.get('module') or params.get('source_module')
    if source_module:
        qs = qs.filter(event__source_app=source_module)

    date_from = _parse_datetime_param(params.get('date_from'))
    if date_from:
        qs = qs.filter(created_at__gte=date_from)

    date_to = _parse_datetime_param(params.get('date_to'))
    if date_to:
        qs = qs.filter(created_at__lte=date_to)

    search = params.get('q') or params.get('search')
    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(body__icontains=search))

    return qs.select_related('event').order_by('-created_at')


def _unread_count(user) -> int:
    return Notification.objects.filter(recipient=user, is_read=False, is_archived=False).count()


class NotificationFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _build_feed_queryset(request.user, request.query_params)
        section = request.query_params.get('section', 'all')

        if section == 'action_required':
            candidates = list(qs[:200])
            filtered = [item for item in candidates if requires_action(item)]
            total = len(filtered)
            limit = min(int(request.query_params.get('limit', 50)), 100)
            offset = int(request.query_params.get('offset', 0))
            items = filtered[offset:offset + limit]
        else:
            total = qs.count()
            limit = min(int(request.query_params.get('limit', 50)), 100)
            offset = int(request.query_params.get('offset', 0))
            items = qs[offset:offset + limit]

        return Response(envelope(
            success=True,
            message='Notifications retrieved',
            data={
                'items': NotificationSerializer(items, many=True).data,
                'total': total,
                'limit': limit,
                'offset': offset,
                'unread_count': _unread_count(request.user),
            },
        ))


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = _unread_count(request.user)
        return Response(envelope(success=True, message='Unread count', data={'count': count}))


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id: int):
        notification = (
            Notification.objects.filter(pk=notification_id, recipient=request.user)
            .select_related('event')
            .first()
        )
        if not notification:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
            record_notification_read(notification, actor=request.user)
            push_notification_read(user_id=request.user.pk, notification_id=notification.pk)
        return Response(envelope(success=True, message='Marked as read', data=NotificationSerializer(notification).data))


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        unread = Notification.objects.filter(recipient=request.user, is_read=False, is_archived=False)
        notification_ids = list(unread.values_list('pk', flat=True))
        updated = len(notification_ids)
        if not updated:
            push_unread_count(request.user.pk)
            return Response(envelope(success=True, message='All marked as read', data={'updated': 0}))

        now = timezone.now()
        unread.update(is_read=True, read_at=now)
        for notification in Notification.objects.filter(pk__in=notification_ids).iterator():
            record_notification_read(notification, actor=request.user)
        push_unread_count(request.user.pk)
        return Response(envelope(success=True, message='All marked as read', data={'updated': updated}))


class NotificationArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id: int):
        notification = (
            Notification.objects.filter(pk=notification_id, recipient=request.user)
            .select_related('event')
            .first()
        )
        if not notification:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        notification.is_archived = True
        notification.save(update_fields=['is_archived', 'updated_at'])
        record_notification_archived(notification, actor=request.user)
        push_unread_count(request.user.pk)
        return Response(envelope(success=True, message='Archived', data=NotificationSerializer(notification).data))


class NotificationClickView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id: int):
        notification = (
            Notification.objects.filter(pk=notification_id, recipient=request.user)
            .select_related('event')
            .first()
        )
        if not notification:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        record_notification_clicked(notification, actor=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
            push_notification_read(user_id=request.user.pk, notification_id=notification.pk)
        return Response(envelope(
            success=True,
            message='Click recorded',
            data={'action_url': notification.action_url},
        ))


class NotificationUserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        base = Notification.objects.filter(recipient=request.user)
        counts = base.aggregate(
            total=Count('id'),
            unread=Count('id', filter=Q(is_read=False, is_archived=False)),
            read=Count('id', filter=Q(is_read=True, is_archived=False)),
            archived=Count('id', filter=Q(is_archived=True)),
        )
        action_required = sum(
            1
            for item in base.filter(is_archived=False, is_read=False).select_related('event')[:200]
            if requires_action(item)
        )
        return Response(envelope(
            success=True,
            message='User notification stats',
            data={
                'total': counts['total'],
                'unread': counts['unread'],
                'read': counts['read'],
                'archived': counts['archived'],
                'action_required': action_required,
            },
        ))


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        self._ensure_preferences(request.user)
        prefs = NotificationPreference.objects.filter(user=request.user)
        return Response(envelope(
            success=True,
            message='Preferences retrieved',
            data={'items': NotificationPreferenceSerializer(prefs, many=True).data},
        ))

    def put(self, request):
        serializer = NotificationPreferenceUpdateSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        updated = []
        for item in serializer.validated_data:
            pref, _ = NotificationPreference.objects.update_or_create(
                user=request.user,
                category=item['category'],
                channel=item['channel'],
                defaults={
                    'is_enabled': item['is_enabled'],
                    'frequency': item['frequency'],
                },
            )
            updated.append(pref)
        return Response(envelope(
            success=True,
            message='Preferences updated',
            data={'items': NotificationPreferenceSerializer(updated, many=True).data},
        ))

    def _ensure_preferences(self, user):
        existing = set(
            NotificationPreference.objects.filter(user=user).values_list('category', 'channel')
        )
        rows = [
            NotificationPreference(user=user, category=category.value, channel=channel.value)
            for category in Category
            for channel in NotificationRecipient.Channel
            if (category.value, channel.value) not in existing
        ]
        if rows:
            NotificationPreference.objects.bulk_create(rows, ignore_conflicts=True)


class NotificationCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(envelope(
            success=True,
            message='Categories',
            data={
                'categories': [{'value': c.value, 'label': c.label} for c in Category],
                'priorities': [{'value': p.value, 'label': p.label} for p in Priority],
            },
        ))
