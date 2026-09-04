# Generated manually for email/notification architecture evolution

from django.db import migrations, models


def backwards_populate_selection(apps, schema_editor):
    NotificationTemplate = apps.get_model('notifications', 'NotificationTemplate')
    EventMap = {
        # template_code -> primary event_code (backward-compatible defaults)
        'welcome': 'student.created',
        'password_reset': 'student.password.reset',
        'offer_published': 'internship.offer.published',
        'application_submitted': 'internship.application.submitted',
        'application_accepted': 'internship.application.accepted',
        'application_rejected': 'internship.application.rejected',
        'interview_scheduled': 'internship.application.interview_scheduled',
        'internship_started': 'internship.internship.started',
        'internship_completed': 'internship.internship.completed',
        'document_approved': 'documents.approved',
        'document_rejected': 'documents.rejected',
        'announcement_published': 'announcement.published',
        'weekly_summary': 'notification.digest.weekly',
        'monthly_summary': 'notification.digest.monthly',
        'chat_reminder': 'chat.unread.reminder',
        'chat_new_message': 'chat.message.received',
        'chat_admin_reply': 'internship.chat.reply',
        'chat_conversation_resolved': 'chat.conversation.resolved',
    }
    for tpl in NotificationTemplate.objects.all():
        base_code = tpl.code.replace('_in_app', '')
        event_code = EventMap.get(base_code, '')
        updates = {
            'name': tpl.name or base_code.replace('_', ' ').title(),
            'event_code': event_code or tpl.event_code,
            'status': 'active' if tpl.is_active else 'archived',
        }
        # Mark current production template as both selected and default when event known
        if event_code and tpl.channel == 'EMAIL' and tpl.is_active:
            updates['is_selected'] = True
            updates['is_default'] = True
        NotificationTemplate.objects.filter(pk=tpl.pk).update(**updates)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0006_remove_notification_notif_recip_arch_read_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationtemplate',
            name='name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='notificationtemplate',
            name='event_code',
            field=models.SlugField(blank=True, default='', db_index=True, max_length=128),
        ),
        migrations.AddField(
            model_name='notificationtemplate',
            name='is_selected',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='notificationtemplate',
            name='is_default',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='notificationtemplate',
            name='status',
            field=models.CharField(
                choices=[('active', 'Active'), ('archived', 'Archived')],
                db_index=True,
                default='active',
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name='emailproviderconfig',
            name='provider',
            field=models.CharField(
                choices=[
                    ('mock', 'Mock (development)'),
                    ('sendgrid', 'SendGrid'),
                    ('brevo', 'Brevo'),
                    ('ses', 'Amazon SES'),
                    ('mailgun', 'Mailgun'),
                    ('smtp', 'SMTP'),
                ],
                default='mock',
                max_length=32,
            ),
        ),
        migrations.AddIndex(
            model_name='notificationtemplate',
            index=models.Index(fields=['event_code', 'channel', 'status'], name='notif_tpl_event_ch_st_idx'),
        ),
        migrations.AddIndex(
            model_name='notificationtemplate',
            index=models.Index(fields=['event_code', 'is_selected'], name='notif_tpl_event_sel_idx'),
        ),
        migrations.AddIndex(
            model_name='notificationtemplate',
            index=models.Index(fields=['event_code', 'is_default'], name='notif_tpl_event_def_idx'),
        ),
        migrations.RunPython(backwards_populate_selection, noop_reverse),
    ]
