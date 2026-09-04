from django.db import migrations


TEMPLATE_ROWS = [
    ('srf_submitted', 'Srf Submitted', 'srf.submitted', 'srf'),
    ('srf_approved', 'Srf Approved', 'srf.approved', 'srf'),
    ('srf_rejected', 'Srf Rejected', 'srf.rejected', 'srf'),
    ('srf_risk_alert', 'Srf Risk Alert', 'srf.risk.alert', 'srf'),
    ('srf_installment_overdue', 'Srf Installment Overdue', 'srf.installment.overdue', 'srf'),
    ('student_activated', 'Student Activated', 'student.activated', 'system'),
    ('student_critical_risk', 'Student Critical Risk', 'student.intelligence.critical_risk', 'system'),
    ('supervisor_assigned', 'Supervisor Assigned', 'supervisor.assigned', 'supervision'),
    ('report_escalated', 'Report Escalated', 'report.escalated', 'supervision'),
    ('report_rejected', 'Report Rejected', 'report.rejected', 'supervision'),
    ('report_requires_changes', 'Report Requires Changes', 'report.requires_changes', 'supervision'),
]


def seed_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('notifications', 'NotificationTemplate')
    Translation = apps.get_model('notifications', 'NotificationTemplateTranslation')
    for code, name, event_code, category in TEMPLATE_ROWS:
        tpl, _created = NotificationTemplate.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'event_code': event_code,
                'channel': 'EMAIL',
                'category': category,
                'is_active': True,
                'status': 'active',
                'is_selected': True,
                'is_default': True,
                'html_file': 'email/generic.html',
            },
        )
        NotificationTemplate.objects.filter(pk=tpl.pk).update(
            name=name,
            event_code=event_code,
            status='active',
            is_active=True,
            is_selected=True,
            is_default=True,
        )
        NotificationTemplate.objects.filter(
            event_code=event_code, channel='EMAIL', is_selected=True,
        ).exclude(pk=tpl.pk).update(is_selected=False)
        NotificationTemplate.objects.filter(
            event_code=event_code, channel='EMAIL', is_default=True,
        ).exclude(pk=tpl.pk).update(is_default=False)
        for lang in ('en', 'fr'):
            greeting = 'Hello' if lang == 'en' else 'Bonjour'
            Translation.objects.update_or_create(
                template_id=tpl.pk,
                language=lang,
                defaults={
                    'subject_template': f'{name}: {{{{ title }}}}',
                    'body_html_template': (
                        f'<p>{greeting} {{{{ user_name }}}},</p><p>{{{{ body }}}}</p>'
                    ),
                    'body_text_template': '{{ body }}',
                },
            )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0007_template_selection_and_brevo'),
    ]

    operations = [
        migrations.RunPython(seed_templates, noop),
    ]
