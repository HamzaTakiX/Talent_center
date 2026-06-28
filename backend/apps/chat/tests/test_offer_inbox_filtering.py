"""Offer inbox should only list threads where the student sent a message."""

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.chat.models import Conversation, ConversationContext, ConversationParticipant, Message
from apps.chat.services.conversation_service import list_module_conversations
from apps.stage.services.chat_service import get_or_create_offer_conversation

User = get_user_model()


class OfferInboxStudentEngagementFilterTests(TestCase):
    def setUp(self):
        from apps.accounts_et_roles.models import StudentProfile
        from apps.stage.models import InternshipOffer

        self.admin = User.objects.create_user(email='admin@test.com', password='pass')
        self.admin.role = User.RoleChoices.ADMIN
        self.admin.is_superuser = True
        self.admin.save()

        self.student_user = User.objects.create_user(email='student@test.com', password='pass')
        self.student_user.role = User.RoleChoices.STUDENT
        self.student_user.save()

        self.student = StudentProfile.objects.create(user=self.student_user)
        self.offer_a = InternshipOffer.objects.create(
            title='Offer A',
            company_name='Company A',
            status='OPEN',
        )
        self.offer_b = InternshipOffer.objects.create(
            title='Offer B',
            company_name='Company B',
            status='OPEN',
        )

    def _student_message(self, conversation: Conversation, body: str) -> None:
        Message.objects.create(
            conversation=conversation,
            sender=self.student_user,
            body=body,
            message_type=Message.MessageType.TEXT,
        )
        conversation.last_message_at = conversation.updated_at
        conversation.save(update_fields=['last_message_at', 'updated_at'])

    def test_admin_inbox_excludes_offer_threads_without_student_message(self):
        conv_with_message = get_or_create_offer_conversation(
            offer=self.offer_a,
            student=self.student,
            created_by=self.student_user,
        )
        self._student_message(conv_with_message, 'Question about Offer A')

        get_or_create_offer_conversation(
            offer=self.offer_b,
            student=self.student,
            created_by=self.student_user,
        )

        conv_ids = [conv.pk for conv in list_module_conversations(self.admin, module='offers')]

        self.assertEqual(conv_ids, [conv_with_message.pk])

    def test_student_inbox_excludes_offer_threads_without_student_message(self):
        conv_with_message = get_or_create_offer_conversation(
            offer=self.offer_a,
            student=self.student,
            created_by=self.student_user,
        )
        self._student_message(conv_with_message, 'Question about Offer A')

        get_or_create_offer_conversation(
            offer=self.offer_b,
            student=self.student,
            created_by=self.student_user,
        )

        conv_ids = [conv.pk for conv in list_module_conversations(self.student_user, module='offers')]

        self.assertEqual(conv_ids, [conv_with_message.pk])
