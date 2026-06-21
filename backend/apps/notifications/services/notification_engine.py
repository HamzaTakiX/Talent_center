"""Central notification orchestrator."""

from __future__ import annotations

import logging

from django.db import transaction
from django.utils import timezone

from apps.notifications.channels.in_app import deliver_in_app
from apps.notifications.constants import EventStatus
from apps.notifications.events.registry import EventConfig, get_default_config, get_event_config
from apps.notifications.models import NotificationRecipient
from apps.notifications.services.preference_service import get_user_language, is_digest_frequency, should_deliver
from apps.notifications.services.queue_service import enqueue_recipient, mark_suppressed
from apps.notifications.services.recipient_service import resolve_recipients
from apps.notifications.services.security_service import check_rate_limit
from apps.notifications.services.template_service import render_notification

logger = logging.getLogger(__name__)


class NotificationEngine:
    def process_event(self, event) -> list[NotificationRecipient]:
        config = get_event_config(event.event_code) or get_default_config(event.event_code)
        event.status = EventStatus.PROCESSING
        event.save(update_fields=['status'])

        recipients_created: list[NotificationRecipient] = []
        resolved = resolve_recipients(event, config)
        payload = dict(event.payload_json or {})

        for resolved_recipient in resolved:
            user = resolved_recipient.user
            language = get_user_language(user)
            context = {
                **payload,
                'user': user,
                'user_email': user.email,
                'user_name': getattr(getattr(user, 'profile', None), 'full_name', user.email),
                'event_code': event.event_code,
                'language': language,
            }

            for channel in config.channels:
                enabled, frequency = should_deliver(
                    user=user,
                    channel=channel,
                    config=config,
                    urgent=config.urgent,
                )
                if not enabled:
                    recipient = self._create_recipient(
                        event, user, channel, config, language, suppressed=True,
                    )
                    mark_suppressed(recipient, 'User preference disabled')
                    recipients_created.append(recipient)
                    continue

                if channel != NotificationRecipient.Channel.IN_APP and is_digest_frequency(frequency):
                    if config.digestible:
                        recipient = self._create_recipient(
                            event, user, channel, config, language,
                            status=NotificationRecipient.Status.PENDING,
                            metadata={'digest': frequency},
                        )
                        from apps.notifications.services.digest_service import buffer_for_digest
                        buffer_for_digest(recipient, frequency)
                        recipients_created.append(recipient)
                        continue

                allowed, reason = check_rate_limit(
                    user=user,
                    channel=channel,
                    template_code=config.template_code if channel == NotificationRecipient.Channel.EMAIL else '',
                )
                if not allowed:
                    recipient = self._create_recipient(
                        event, user, channel, config, language, suppressed=True,
                    )
                    mark_suppressed(recipient, reason)
                    recipients_created.append(recipient)
                    continue

                rendered = render_notification(
                    template_code=config.template_code,
                    channel=channel,
                    language=language,
                    context=context,
                )

                recipient = self._create_recipient(
                    event, user, channel, config, language,
                    metadata={'role': resolved_recipient.role},
                )
                recipients_created.append(recipient)

                if channel == NotificationRecipient.Channel.IN_APP:
                    deliver_in_app(
                        recipient=recipient,
                        rendered=rendered,
                        event_code=event.event_code,
                        payload=payload,
                    )
                else:
                    recipient.metadata_json = {
                        **(recipient.metadata_json or {}),
                        'rendered_subject': rendered.subject,
                        'rendered_body_html': rendered.body_html,
                        'rendered_body_text': rendered.body_text,
                    }
                    recipient.save(update_fields=['metadata_json', 'updated_at'])
                    enqueue_recipient(recipient)

        event.status = EventStatus.PROCESSED
        event.processed_at = timezone.now()
        event.save(update_fields=['status', 'processed_at'])
        return recipients_created

    def _create_recipient(
        self,
        event,
        user,
        channel: str,
        config: EventConfig,
        language: str,
        *,
        status: str = NotificationRecipient.Status.PENDING,
        suppressed: bool = False,
        metadata: dict | None = None,
    ) -> NotificationRecipient:
        final_status = NotificationRecipient.Status.SUPPRESSED if suppressed else status
        recipient, created = NotificationRecipient.objects.get_or_create(
            event=event,
            user=user,
            delivery_channel=channel,
            defaults={
                'status': final_status,
                'template_code': config.template_code,
                'language': language,
                'metadata_json': metadata or {},
            },
        )
        if not created and not suppressed:
            recipient.template_code = config.template_code
            recipient.language = language
            recipient.status = final_status
            if metadata:
                recipient.metadata_json = {**(recipient.metadata_json or {}), **metadata}
            recipient.save()
        return recipient


_engine: NotificationEngine | None = None


def get_notification_engine() -> NotificationEngine:
    global _engine
    if _engine is None:
        _engine = NotificationEngine()
    return _engine
