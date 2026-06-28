"""Conversation workflow tests — auto-reopen on resolved threads."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from apps.chat.models import Conversation, ConversationContext, ConversationParticipant, Message
from apps.chat.services.message_service import send_message

User = get_user_model()


class ResolvedConversationReopenTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(email='student@test.com', password='pass')
        self.student.role = User.RoleChoices.STUDENT
        self.student.save()

        self.admin = User.objects.create_user(email='admin@test.com', password='pass')
        self.admin.role = User.RoleChoices.ADMIN
        self.admin.save()

        self.conversation = Conversation.objects.create(
            title='Support thread',
            conversation_type=Conversation.ConversationType.DIRECT,
            metadata_json={
                'resolved': True,
                'resolved_at': '2026-01-01T00:00:00+00:00',
                'resolved_by': self.admin.pk,
            },
        )
        ConversationContext.objects.create(
            conversation=self.conversation,
            module=ConversationContext.Module.PLATFORM,
            context_kind=ConversationContext.ContextKind.DIRECT,
            entity_type='student_admin_dm',
            entity_id=str(self.student.pk),
            workflow_state=ConversationContext.WorkflowState.RESOLVED,
            workflow_status='RESOLVED',
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

    def test_student_message_reopens_to_waiting_admin(self):
        with patch('apps.chat.services.message_service.publish_conversation_updated') as pub_conv:
            with patch('apps.chat.services.message_service.publish_message_created'):
                with patch('apps.chat.services.message_service.publish_inbox_updated'):
                    msg = send_message(
                        user=self.student,
                        conversation_id=self.conversation.pk,
                        body='I have another question',
                    )

        self.assertIsNotNone(msg)
        self.conversation.refresh_from_db()
        ctx = self.conversation.context
        ctx.refresh_from_db()

        self.assertEqual(ctx.workflow_state, ConversationContext.WorkflowState.WAITING_ADMIN)
        self.assertEqual(ctx.workflow_status, 'OPEN')
        self.assertNotIn('resolved', self.conversation.metadata_json)
        self.assertNotIn('resolved_at', self.conversation.metadata_json)
        self.assertNotIn('resolved_by', self.conversation.metadata_json)

        event = Message.objects.filter(
            conversation=self.conversation,
            message_type=Message.MessageType.EVENT,
            metadata_json__smart_action='auto_reopen',
        ).first()
        self.assertIsNotNone(event)
        pub_conv.assert_called_once()
        self.assertTrue(pub_conv.call_args[0][1].get('reopened'))

    def test_admin_message_reopens_to_waiting_student(self):
        with patch('apps.chat.services.message_service.publish_conversation_updated'):
            with patch('apps.chat.services.message_service.publish_message_created'):
                with patch('apps.chat.services.message_service.publish_inbox_updated'):
                    msg = send_message(
                        user=self.admin,
                        conversation_id=self.conversation.pk,
                        body='Following up on your case',
                    )

        self.assertIsNotNone(msg)
        ctx = self.conversation.context
        ctx.refresh_from_db()

        self.assertEqual(ctx.workflow_state, ConversationContext.WorkflowState.WAITING_STUDENT)
        self.assertEqual(ctx.workflow_status, 'OPEN')
        self.conversation.refresh_from_db()
        self.assertNotIn('resolved', self.conversation.metadata_json)

    def test_attachment_upload_reopens_resolved_conversation(self):
        upload = SimpleUploadedFile('cv.pdf', b'%PDF-1.4', content_type='application/pdf')
        with patch('apps.chat.services.message_service.publish_conversation_updated'):
            with patch('apps.chat.services.message_service.publish_message_created'):
                with patch('apps.chat.services.message_service.publish_inbox_updated'):
                    msg = send_message(
                        user=self.student,
                        conversation_id=self.conversation.pk,
                        body='',
                        uploaded_files=[upload],
                    )

        self.assertIsNotNone(msg)
        ctx = self.conversation.context
        ctx.refresh_from_db()
        self.assertEqual(ctx.workflow_state, ConversationContext.WorkflowState.WAITING_ADMIN)

    def test_archived_workflow_state_is_not_reopened(self):
        ctx = self.conversation.context
        ctx.workflow_state = ConversationContext.WorkflowState.ARCHIVED
        ctx.workflow_status = 'ARCHIVED'
        ctx.save(update_fields=['workflow_state', 'workflow_status', 'updated_at'])

        with patch('apps.chat.services.message_service.publish_conversation_updated') as pub_conv:
            msg = send_message(
                user=self.student,
                conversation_id=self.conversation.pk,
                body='Hello again',
            )

        self.assertIsNotNone(msg)
        ctx.refresh_from_db()
        self.assertEqual(ctx.workflow_state, ConversationContext.WorkflowState.ARCHIVED)
        pub_conv.assert_not_called()

    def test_offer_conversation_restores_application_status_on_reopen(self):
        ctx = self.conversation.context
        ctx.module = ConversationContext.Module.OFFERS
        ctx.workflow_status = 'RESOLVED'
        ctx.context_snapshot_json = {'application_status': 'UNDER_REVIEW'}
        ctx.save(update_fields=['module', 'workflow_status', 'context_snapshot_json', 'updated_at'])

        with patch('apps.chat.services.message_service.publish_conversation_updated'):
            with patch('apps.chat.services.message_service.publish_message_created'):
                with patch('apps.chat.services.message_service.publish_inbox_updated'):
                    send_message(
                        user=self.student,
                        conversation_id=self.conversation.pk,
                        body='Update please',
                    )

        ctx.refresh_from_db()
        self.assertEqual(ctx.workflow_state, ConversationContext.WorkflowState.WAITING_ADMIN)
        self.assertEqual(ctx.workflow_status, 'UNDER_REVIEW')
