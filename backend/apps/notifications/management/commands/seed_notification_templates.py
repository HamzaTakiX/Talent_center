"""Seed notification templates with FR/EN translations."""

from django.core.management.base import BaseCommand

from apps.notifications.constants import Category
from apps.notifications.models import NotificationRecipient, NotificationTemplate, NotificationTemplateTranslation

TEMPLATE_DEFINITIONS = [
    {
        'code': 'welcome',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Welcome to {{ platform_name }}',
                'body_html': '<h2>Welcome, {{ user_name }}!</h2><p>Your account is ready.</p>',
                'body_text': 'Welcome, {{ user_name }}! Your account is ready.',
                'in_app_title': 'Welcome',
                'in_app_body': 'Welcome to {{ platform_name }}',
            },
            'fr': {
                'subject': 'Bienvenue sur {{ platform_name }}',
                'body_html': '<h2>Bienvenue, {{ user_name }} !</h2><p>Votre compte est prêt.</p>',
                'body_text': 'Bienvenue, {{ user_name }} ! Votre compte est prêt.',
                'in_app_title': 'Bienvenue',
                'in_app_body': 'Bienvenue sur {{ platform_name }}',
            },
        },
    },
    {
        'code': 'password_reset',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'default_action_url': '{{ reset_url }}',
        'translations': {
            'en': {
                'subject': 'Reset your password',
                'body_html': '<p>Click the link below to reset your password. Valid for {{ ttl_minutes }} minutes.</p>',
                'body_text': 'Reset your password: {{ reset_url }}',
                'in_app_title': '',
                'in_app_body': '',
            },
            'fr': {
                'subject': 'Réinitialisation de votre mot de passe',
                'body_html': '<p>Cliquez sur le lien ci-dessous. Valide {{ ttl_minutes }} minutes.</p>',
                'body_text': 'Réinitialisez votre mot de passe : {{ reset_url }}',
                'in_app_title': '',
                'in_app_body': '',
            },
        },
    },
    {
        'code': 'offer_published',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.OFFERS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'New internship offer: {{ title }}',
                'body_html': '<h2>{{ title }}</h2><p>{{ body }}</p>',
                'body_text': '{{ title }} — {{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Nouvelle offre de stage : {{ title }}',
                'body_html': '<h2>{{ title }}</h2><p>{{ body }}</p>',
                'body_text': '{{ title }} — {{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'application_submitted',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Application submitted: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Candidature soumise : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'application_accepted',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Application accepted: {{ title }}',
                'body_html': '<p>Congratulations! {{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Application accepted',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Candidature acceptée : {{ title }}',
                'body_html': '<p>Félicitations ! {{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Candidature acceptée',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'application_rejected',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Application update: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Application update',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Mise à jour candidature : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Mise à jour candidature',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'interview_scheduled',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Interview scheduled: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Interview scheduled',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Entretien planifié : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Entretien planifié',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'internship_started',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Internship started: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Internship started',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Stage démarré : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Stage démarré',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'internship_completed',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.APPLICATIONS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Internship completed: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Internship completed',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Stage terminé : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Stage terminé',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'document_approved',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.DOCUMENTS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Document approved: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Document approved',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Document approuvé : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Document approuvé',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'document_rejected',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.DOCUMENTS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Document rejected: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Document rejected',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Document rejeté : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Document rejeté',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'announcement_published',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.ANNOUNCEMENTS,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'New announcement: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Nouvelle annonce : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'weekly_summary',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Your weekly summary',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Weekly summary',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Votre résumé hebdomadaire',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Résumé hebdomadaire',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'monthly_summary',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Your monthly summary',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Monthly summary',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Votre résumé mensuel',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Résumé mensuel',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'chat_reminder',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.CHAT,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Unread messages: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Messages non lus : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'chat_new_message',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.CHAT,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'New message: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Nouveau message : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'chat_admin_reply',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.CHAT,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': 'Admin reply: {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Réponse administrateur : {{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': '{{ title }}',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'chat_conversation_resolved',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.CHAT,
        'html_file': 'email/generic.html',
        'translations': {
            'en': {
                'subject': '{{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Conversation resolved',
                'in_app_body': (
                    'Your request has been marked as resolved. '
                    'You can still reply to this conversation if you need further assistance.'
                ),
            },
            'fr': {
                'subject': '{{ title }}',
                'body_html': '<p>{{ body }}</p>',
                'body_text': '{{ body }}',
                'in_app_title': 'Conversation résolue',
                'in_app_body': (
                    'Votre demande a été marquée comme résolue. '
                    'Vous pouvez toujours répondre à cette conversation si vous avez besoin '
                    "d'une assistance supplémentaire."
                ),
            },
        },
    },
]

# IN_APP variants for feed rendering
IN_APP_CODES = [
    'offer_published', 'application_submitted', 'application_accepted',
    'application_rejected', 'interview_scheduled', 'chat_reminder',
    'document_approved', 'document_rejected', 'announcement_published',
]


class Command(BaseCommand):
    help = 'Seed notification templates with FR/EN translations'

    def handle(self, *args, **options):
        created = 0
        for definition in TEMPLATE_DEFINITIONS:
            template, was_created = NotificationTemplate.objects.update_or_create(
                code=definition['code'],
                defaults={
                    'channel': definition['channel'],
                    'category': definition['category'],
                    'html_file': definition.get('html_file', ''),
                    'default_action_url': definition.get('default_action_url', ''),
                    'is_active': True,
                },
            )
            if was_created:
                created += 1
            for lang, content in definition['translations'].items():
                NotificationTemplateTranslation.objects.update_or_create(
                    template=template,
                    language=lang,
                    defaults={
                        'subject_template': content['subject'],
                        'body_html_template': content['body_html'],
                        'body_text_template': content['body_text'],
                        'in_app_title_template': content.get('in_app_title', ''),
                        'in_app_body_template': content.get('in_app_body', ''),
                    },
                )

        for code in IN_APP_CODES:
            email_tpl = NotificationTemplate.objects.filter(code=code).first()
            if not email_tpl:
                continue
            in_app_tpl, _ = NotificationTemplate.objects.update_or_create(
                code=f'{code}_in_app',
                defaults={
                    'channel': NotificationRecipient.Channel.IN_APP,
                    'category': email_tpl.category,
                    'is_active': True,
                },
            )
            for translation in email_tpl.translations.all():
                NotificationTemplateTranslation.objects.update_or_create(
                    template=in_app_tpl,
                    language=translation.language,
                    defaults={
                        'subject_template': translation.in_app_title_template or translation.subject_template,
                        'body_html_template': '',
                        'body_text_template': '',
                        'in_app_title_template': translation.in_app_title_template,
                        'in_app_body_template': translation.in_app_body_template,
                    },
                )

        self.stdout.write(self.style.SUCCESS(f'Seeded templates ({created} new email templates)'))
