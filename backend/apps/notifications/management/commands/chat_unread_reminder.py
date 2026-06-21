from django.core.management.base import BaseCommand

from apps.notifications.jobs.process_queue import process_notification_batch


class Command(BaseCommand):
    help = 'Remind users about unread chat messages'

    def handle(self, *args, **options):
        from apps.chat.models import ConversationParticipant, Message
        from apps.notifications.events.publisher import emit_event
        from django.utils import timezone
        from datetime import timedelta

        cutoff = timezone.now() - timedelta(hours=24)
        count = 0
        participants = ConversationParticipant.objects.filter(
            left_at__isnull=True,
        ).select_related('user', 'conversation')
        for part in participants:
            last_read = part.last_read_message_id or 0
            unread = Message.objects.filter(
                conversation_id=part.conversation_id,
                deleted_at__isnull=True,
                pk__gt=last_read,
                created_at__lte=cutoff,
            ).exclude(sender_id=part.user_id).exists()
            if unread:
                emit_event(
                    event_code='chat.unread.reminder',
                    source_app='notifications',
                    entity_type='conversation',
                    entity_id=part.conversation_id,
                    payload={
                        'conversation_id': part.conversation_id,
                        'recipient_user_id': part.user_id,
                        'title': 'Unread messages',
                        'body': 'You have unread messages waiting for you.',
                    },
                )
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Sent {count} chat reminders'))
