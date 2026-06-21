"""Super Admin notification monitoring API."""

from __future__ import annotations

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import IsSuperAdmin
from apps.authentication.utils import envelope
from apps.notifications.api.serializers import QueueRecipientSerializer
from apps.notifications.models import NotificationRecipient
from apps.notifications.services.analytics_service import (
    get_overview_metrics,
    get_provider_health,
    get_queue_stats,
    get_recent_events,
    get_top_templates,
)
from apps.notifications.services.queue_service import enqueue_recipient


class AdminNotificationQueueView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = NotificationRecipient.objects.filter(
            status__in=[
                NotificationRecipient.Status.PENDING,
                NotificationRecipient.Status.QUEUED,
                NotificationRecipient.Status.RETRY_SCHEDULED,
                NotificationRecipient.Status.PROCESSING,
            ],
        ).select_related('user', 'event').order_by('-created_at')[:100]
        return Response(envelope(
            success=True,
            message='Queue',
            data={'items': QueueRecipientSerializer(qs, many=True).data, 'stats': get_queue_stats()},
        ))


class AdminNotificationFailedView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = NotificationRecipient.objects.filter(
            status=NotificationRecipient.Status.FAILED,
        ).select_related('user', 'event').order_by('-updated_at')[:100]
        return Response(envelope(
            success=True,
            message='Failed notifications',
            data={'items': QueueRecipientSerializer(qs, many=True).data},
        ))


class AdminNotificationRetryView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, recipient_id: int):
        recipient = NotificationRecipient.objects.filter(pk=recipient_id).first()
        if not recipient:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        recipient.status = NotificationRecipient.Status.QUEUED
        recipient.next_retry_at = None
        recipient.attempts = 0
        recipient.last_error = ''
        recipient.save()
        enqueue_recipient(recipient)
        return Response(envelope(success=True, message='Retry queued', data={'id': recipient.pk}))


class AdminNotificationAnalyticsOverviewView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(envelope(
            success=True,
            message='Analytics overview',
            data=get_overview_metrics(days=days),
        ))


class AdminNotificationAnalyticsTemplatesView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response(envelope(
            success=True,
            message='Top templates',
            data={'items': get_top_templates()},
        ))


class AdminNotificationProviderHealthView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response(envelope(
            success=True,
            message='Provider health',
            data={'items': get_provider_health()},
        ))


class AdminNotificationEventsView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response(envelope(
            success=True,
            message='Recent events',
            data={'items': get_recent_events()},
        ))


class SendGridWebhookView(APIView):
    """Stub webhook for SendGrid delivery events."""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        events = request.data if isinstance(request.data, list) else [request.data]
        updated = 0
        for event in events:
            message_id = event.get('sg_message_id', '')
            event_type = event.get('event', '')
            if not message_id:
                continue
            recipient = NotificationRecipient.objects.filter(provider_message_id__icontains=message_id[:20]).first()
            if not recipient:
                continue
            now = timezone.now()
            if event_type == 'delivered':
                recipient.status = NotificationRecipient.Status.DELIVERED
                recipient.delivered_at = now
            elif event_type == 'open':
                recipient.status = NotificationRecipient.Status.OPENED
                recipient.opened_at = now
            elif event_type == 'click':
                recipient.status = NotificationRecipient.Status.CLICKED
                recipient.clicked_at = now
            elif event_type == 'bounce':
                recipient.status = NotificationRecipient.Status.BOUNCED
            recipient.save()
            updated += 1
        return Response({'processed': updated})
