# Generated manually for real-time chat extensions

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0003_alter_conversationcontext_options_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MessageRead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('read_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    'message',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='read_receipts',
                        to='chat.message',
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='message_reads',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'indexes': [
                    models.Index(fields=['user', '-read_at'], name='chat_messag_user_id_6f1a2b_idx'),
                    models.Index(fields=['message', 'read_at'], name='chat_messag_message_8c3d4e_idx'),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name='messageread',
            constraint=models.UniqueConstraint(
                fields=('message', 'user'),
                name='uniq_message_read_per_user',
            ),
        ),
        migrations.AddField(
            model_name='conversationcontext',
            name='conversation_type',
            field=models.CharField(
                choices=[
                    ('offer_question', 'Offer question'),
                    ('application_followup', 'Application follow-up'),
                    ('interview_discussion', 'Interview discussion'),
                    ('document_request', 'Document request'),
                    ('general_support', 'General internship support'),
                ],
                db_index=True,
                default='offer_question',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='conversationcontext',
            name='workflow_state',
            field=models.CharField(
                choices=[
                    ('NEW', 'New'),
                    ('ASSIGNED', 'Assigned'),
                    ('WAITING_STUDENT', 'Waiting student'),
                    ('WAITING_ADMIN', 'Waiting admin'),
                    ('RESOLVED', 'Resolved'),
                    ('ARCHIVED', 'Archived'),
                    ('ESCALATED', 'Escalated'),
                ],
                db_index=True,
                default='NEW',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='conversationcontext',
            name='assigned_to',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_chat_conversations',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='conversationcontext',
            name='urgency',
            field=models.CharField(
                choices=[
                    ('NONE', 'None'),
                    ('LOW', 'Low'),
                    ('NORMAL', 'Normal'),
                    ('HIGH', 'High'),
                    ('CRITICAL', 'Critical'),
                ],
                db_index=True,
                default='NORMAL',
                max_length=16,
            ),
        ),
    ]
