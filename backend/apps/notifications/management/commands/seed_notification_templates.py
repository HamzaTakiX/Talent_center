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


DEDICATED_EMAIL_TEMPLATES = [
    {
        'code': 'srf_submitted',
        'name': 'Srf Submitted',
        'event_code': 'srf.submitted',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SRF,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Srf Submitted: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Submitted',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Srf Submitted : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Submitted',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'srf_approved',
        'name': 'Srf Approved',
        'event_code': 'srf.approved',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SRF,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Srf Approved: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Approved',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Srf Approved : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Approved',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'srf_rejected',
        'name': 'Srf Rejected',
        'event_code': 'srf.rejected',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SRF,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Srf Rejected: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Rejected',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Srf Rejected : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Rejected',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'srf_risk_alert',
        'name': 'Srf Risk Alert',
        'event_code': 'srf.risk.alert',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SRF,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Srf Risk Alert: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Risk Alert',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Srf Risk Alert : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Risk Alert',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'srf_installment_overdue',
        'name': 'Srf Installment Overdue',
        'event_code': 'srf.installment.overdue',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SRF,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Srf Installment Overdue: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Installment Overdue',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Srf Installment Overdue : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Srf Installment Overdue',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'student_activated',
        'name': 'Student Activated',
        'event_code': 'student.activated',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Student Activated: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Student Activated',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Student Activated : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Student Activated',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'student_critical_risk',
        'name': 'Student Critical Risk',
        'event_code': 'student.intelligence.critical_risk',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SYSTEM,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Student Critical Risk: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Student Critical Risk',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Student Critical Risk : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Student Critical Risk',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'supervisor_assigned',
        'name': 'Supervisor Assigned',
        'event_code': 'supervisor.assigned',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SUPERVISION,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Supervisor Assigned: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Supervisor Assigned',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Supervisor Assigned : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Supervisor Assigned',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'report_escalated',
        'name': 'Report Escalated',
        'event_code': 'report.escalated',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SUPERVISION,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Report Escalated: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Escalated',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Report Escalated : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Escalated',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'report_rejected',
        'name': 'Report Rejected',
        'event_code': 'report.rejected',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SUPERVISION,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Report Rejected: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Rejected',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Report Rejected : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Rejected',
                'in_app_body': '{{ body }}',
            },
        },
    },
    {
        'code': 'report_requires_changes',
        'name': 'Report Requires Changes',
        'event_code': 'report.requires_changes',
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.SUPERVISION,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': 'Report Requires Changes: {{ title }}',
                'body_html': '<p>Hello {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Open</a></p>',
                'body_text': 'Hello {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Requires Changes',
                'in_app_body': '{{ body }}',
            },
            'fr': {
                'subject': 'Report Requires Changes : {{ title }}',
                'body_html': '<p>Bonjour {{ user_name }},</p><p>{{ body }}</p><p><a href="{{ action_url }}">Ouvrir</a></p>',
                'body_text': 'Bonjour {{ user_name }}. {{ body }}',
                'in_app_title': 'Report Requires Changes',
                'in_app_body': '{{ body }}',
            },
        },
    },
]

def _agenda_template(code: str, event_code: str, en_subject: str, fr_subject: str) -> dict:
    """Agenda templates share one layout; only the heading differs per event."""
    return {
        'code': code,
        'name': code.replace('_', ' ').title(),
        'event_code': event_code,
        'channel': NotificationRecipient.Channel.EMAIL,
        'category': Category.AGENDA,
        'html_file': 'email/generic.html',
        'is_selected': True,
        'is_default': True,
        'translations': {
            'en': {
                'subject': en_subject,
                'body_html': (
                    '<p>Hello {{ user_name }},</p>'
                    '<p><strong>{{ title }}</strong></p>'
                    '<p>{{ start }} → {{ end }} ({{ timezone }})</p>'
                    '<p><a href="{{ action_url }}">Open in calendar</a></p>'
                ),
                'body_text': 'Hello {{ user_name }}. {{ title }} — {{ start }} to {{ end }} ({{ timezone }}).',
                'in_app_title': en_subject,
                'in_app_body': '{{ title }} — {{ start }}',
            },
            'fr': {
                'subject': fr_subject,
                'body_html': (
                    '<p>Bonjour {{ user_name }},</p>'
                    '<p><strong>{{ title }}</strong></p>'
                    '<p>{{ start }} → {{ end }} ({{ timezone }})</p>'
                    '<p><a href="{{ action_url }}">Ouvrir dans l\'agenda</a></p>'
                ),
                'body_text': 'Bonjour {{ user_name }}. {{ title }} — {{ start }} à {{ end }} ({{ timezone }}).',
                'in_app_title': fr_subject,
                'in_app_body': '{{ title }} — {{ start }}',
            },
        },
    }


AGENDA_TEMPLATES = [
    _agenda_template(
        'agenda_event_created', 'agenda.event.created',
        'New event: {{ title }}', 'Nouvel événement : {{ title }}',
    ),
    _agenda_template(
        'agenda_invitation', 'agenda.invitation.sent',
        'Invitation: {{ title }}', 'Invitation : {{ title }}',
    ),
    _agenda_template(
        'agenda_invitation_answered', 'agenda.invitation.answered',
        'Invitation response: {{ title }}', 'Réponse à l\'invitation : {{ title }}',
    ),
    _agenda_template(
        'agenda_event_updated', 'agenda.event.updated',
        'Event updated: {{ title }}', 'Événement mis à jour : {{ title }}',
    ),
    _agenda_template(
        'agenda_event_rescheduled', 'agenda.event.rescheduled',
        'Event rescheduled: {{ title }}', 'Événement reprogrammé : {{ title }}',
    ),
    _agenda_template(
        'agenda_event_cancelled', 'agenda.event.cancelled',
        'Event cancelled: {{ title }}', 'Événement annulé : {{ title }}',
    ),
    _agenda_template(
        'agenda_event_reminder', 'agenda.event.reminder',
        'Reminder: {{ title }}', 'Rappel : {{ title }}',
    ),
    _agenda_template(
        'agenda_participant_removed', 'agenda.participant.removed',
        'Removed from event: {{ title }}', 'Retiré de l\'événement : {{ title }}',
    ),
]

IN_APP_CODES += [definition['code'] for definition in AGENDA_TEMPLATES]
DEDICATED_EMAIL_TEMPLATES += AGENDA_TEMPLATES


class Command(BaseCommand):
    help = 'Seed notification templates with FR/EN translations'

    def handle(self, *args, **options):
        created = 0
        for definition in list(TEMPLATE_DEFINITIONS) + list(DEDICATED_EMAIL_TEMPLATES):
            template, was_created = NotificationTemplate.objects.update_or_create(
                code=definition['code'],
                defaults={
                    'name': definition.get('name') or definition['code'].replace('_', ' ').title(),
                    'event_code': definition.get('event_code', ''),
                    'channel': definition['channel'],
                    'category': definition['category'],
                    'html_file': definition.get('html_file', ''),
                    'default_action_url': definition.get('default_action_url', ''),
                    'is_active': True,
                    'status': NotificationTemplate.Status.ACTIVE,
                    'is_selected': bool(definition.get('is_selected', False)),
                    'is_default': bool(definition.get('is_default', False)),
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
