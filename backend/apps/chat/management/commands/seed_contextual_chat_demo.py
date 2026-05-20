"""Seed demo contextual conversations per module (development)."""

from django.core.management.base import BaseCommand

from apps.accounts_et_roles.models import User
from apps.chat.models import ConversationParticipant
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.message_service import send_message
from apps.chat.services.seed import seed_chat_infrastructure


class Command(BaseCommand):
    help = 'Seed enterprise channels, tags, and demo workflow threads per module.'

    def handle(self, *args, **options):
        seed_chat_infrastructure()
        admins = list(
            User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True).order_by('id')
        )
        if not admins:
            self.stdout.write(self.style.WARNING('No admin user — skip demo threads'))
            return

        creator = admins[0]

        demos = [
            ('documents', 'document_request', 'demo-req-1', 'Convention — signature manquante', 'pending_validation'),
            ('srf', 'payment', 'demo-pay-1', 'Tranche 2 — preuve en attente', 'awaiting_proof'),
            ('announcements', 'announcement', 'demo-ann-1', 'Campagne rentrée — questions', 'published'),
            ('encadrant', 'supervision', 'demo-sup-1', 'Suivi encadrant — rapport semaine 11', 'internship_followup'),
            ('meetings', 'meeting', 'demo-meet-1', 'Réunion mi-parcours — préparation', 'scheduled'),
            ('platform', 'administration', 'demo-admin-1', '#administration — coordination', 'active'),
            ('platform', 'student_success', 'demo-student-1', 'Canal réussite étudiante', 'active'),
        ]
        for module, entity_type, entity_id, title, status in demos:
            conv = get_or_create_contextual_conversation(
                module=module,
                entity_type=entity_type,
                entity_id=entity_id,
                title=title,
                workflow_status=status,
                entity_label=title,
                participant_users=admins,
                created_by=creator,
                context_snapshot={
                    'deadline': '2026-06-15',
                    'related_files': [{'name': 'workflow_attachment.pdf'}],
                    'recent_actions': ['Thread créé', 'Participants notifiés'],
                },
            )
            for user in admins:
                ConversationParticipant.objects.get_or_create(
                    conversation=conv,
                    user=user,
                    defaults={'role': ConversationParticipant.Role.MEMBER},
                )
            if not conv.messages.exists():
                send_message(
                    user=creator,
                    conversation_id=conv.pk,
                    body=f'Fil contextuel {module} initialisé.',
                    tag_codes=['feedback'],
                )
        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded {len(demos)} demo threads for {len(admins)} admin(s).'
            )
        )
