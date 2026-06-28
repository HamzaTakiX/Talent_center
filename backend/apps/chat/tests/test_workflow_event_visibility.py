"""Workflow event visibility — students see lifecycle events, not internal admin actions."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.chat.constants import STUDENT_HIDDEN_SMART_ACTIONS
from apps.chat.models import Conversation, ConversationContext, ConversationParticipant, Message
from apps.chat.services.conversation_service import apply_smart_action
from apps.chat.services.message_service import list_messages

User = get_user_model()


class WorkflowEventVisibilityTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(email='student-vis@test.com', password='pass')
        self.student.role = User.RoleChoices.STUDENT
        self.student.save()

        self.admin = User.objects.create_user(email='admin-vis@test.com', password='pass')
        self.admin.role = User.RoleChoices.ADMIN
        self.admin.save()

        self.conversation = Conversation.objects.create(
            title='Visibility thread',
            conversation_type=Conversation.ConversationType.DIRECT,
        )
        ConversationContext.objects.create(
            conversation=self.conversation,
            module=ConversationContext.Module.PLATFORM,
            context_kind=ConversationContext.ContextKind.DIRECT,
            entity_type='student_admin_dm',
            entity_id=str(self.student.pk),
            student_user=self.student,
        )
        for user, role in (
            (self.student, ConversationParticipant.Role.MEMBER),
            (self.admin, ConversationParticipant.Role.ADMIN),
        ):
            ConversationParticipant.objects.create(
                conversation=self.conversation,
                user=user,
                role=role,
            )

    def _create_event(self, action_code: str) -> Message:
        return Message.objects.create(
            conversation=self.conversation,
            sender=self.admin,
            body=f'[Action: {action_code}]',
            message_type=Message.MessageType.EVENT,
            metadata_json={'smart_action': action_code},
        )

    def test_student_sees_mark_resolved_and_auto_reopen(self):
        self._create_event('mark_resolved')
        self._create_event('auto_reopen')

        visible_actions = {
            (m.metadata_json or {}).get('smart_action')
            for m in list_messages(self.student, self.conversation.pk)
        }
        self.assertIn('mark_resolved', visible_actions)
        self.assertIn('auto_reopen', visible_actions)

    def test_student_does_not_see_internal_admin_actions(self):
        for action_code in STUDENT_HIDDEN_SMART_ACTIONS:
            self._create_event(action_code)

        visible_actions = {
            (m.metadata_json or {}).get('smart_action')
            for m in list_messages(self.student, self.conversation.pk)
        }
        self.assertFalse(visible_actions & set(STUDENT_HIDDEN_SMART_ACTIONS))

    def test_mark_resolved_emits_notification_for_student(self):
        with patch('apps.chat.services.conversation_service.publish_message_created'):
            with patch('apps.chat.services.conversation_service.publish_conversation_updated'):
                with patch('django.db.transaction.on_commit', lambda fn: fn()):
                    with patch('apps.notifications.events.publisher.emit_event') as emit_event:
                        apply_smart_action(
                            conversation=self.conversation,
                            action_code='mark_resolved',
                            actor=self.admin,
                        )

        emit_event.assert_called_once()
        self.assertEqual(emit_event.call_args.kwargs['event_code'], 'chat.conversation.resolved')
        payload = emit_event.call_args.kwargs['payload']
        self.assertEqual(payload['title'], 'Conversation résolue')
        self.assertIn('marquée comme résolue', payload['body'])
