"""Notification API views."""

from __future__ import annotations

from django.utils import timezone
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
from apps.notifications.constants import Category
from apps.notifications.models import Notification, NotificationPreference, NotificationRecipient


class NotificationFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(recipient=request.user, is_archived=False)
        if request.query_params.get('unread') == 'true':
            qs = qs.filter(is_read=False)
        limit = min(int(request.query_params.get('limit', 50)), 100)
        offset = int(request.query_params.get('offset', 0))
        items = qs[offset:offset + limit]
        return Response(envelope(
            success=True,
            message='Notifications retrieved',
            data={
                'items': NotificationSerializer(items, many=True).data,
                'unread_count': Notification.objects.filter(recipient=request.user, is_read=False).count(),
            },
        ))


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False, is_archived=False).count()
        return Response(envelope(success=True, message='Unread count', data={'count': count}))


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id: int):
        notification = Notification.objects.filter(pk=notification_id, recipient=request.user).first()
        if not notification:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        return Response(envelope(success=True, message='Marked as read', data=NotificationSerializer(notification).data))


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now(),
        )
        return Response(envelope(success=True, message='All marked as read', data={'updated': updated}))


class NotificationArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id: int):
        notification = Notification.objects.filter(pk=notification_id, recipient=request.user).first()
        if not notification:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        notification.is_archived = True
        notification.save(update_fields=['is_archived', 'updated_at'])
        return Response(envelope(success=True, message='Archived', data=NotificationSerializer(notification).data))


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs = NotificationPreference.objects.filter(user=request.user)
        if not prefs.exists():
            prefs = self._default_preferences(request.user)
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

    def _default_preferences(self, user):
        defaults = []
        for category in Category:
            for channel in NotificationRecipient.Channel:
                pref, _ = NotificationPreference.objects.get_or_create(
                    user=user,
                    category=category.value,
                    channel=channel.value,
                )
                defaults.append(pref)
        return defaults


class NotificationCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(envelope(
            success=True,
            message='Categories',
            data={'categories': [{'value': c.value, 'label': c.label} for c in Category]},
        ))
