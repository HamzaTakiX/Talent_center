# Generated manually for contextual chat infrastructure

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ConversationContext',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('module', models.CharField(choices=[('platform', 'Platform'), ('documents', 'Documents'), ('srf', 'SRF'), ('announcements', 'Announcements'), ('encadrant', 'Encadrant'), ('meetings', 'Meetings'), ('smart_assignment', 'Smart assignment'), ('offers', 'Internship offers')], db_index=True, max_length=32)),
                ('context_kind', models.CharField(choices=[('workflow_thread', 'Workflow thread'), ('channel', 'Channel'), ('direct', 'Direct'), ('announcement_thread', 'Announcement thread'), ('meeting_thread', 'Meeting thread')], db_index=True, default='workflow_thread', max_length=32)),
                ('entity_type', models.CharField(blank=True, db_index=True, default='', max_length=64)),
                ('entity_id', models.CharField(blank=True, db_index=True, default='', max_length=64)),
                ('entity_label', models.CharField(blank=True, default='', max_length=255)),
                ('workflow_status', models.CharField(blank=True, default='', max_length=64)),
                ('urgency', models.CharField(choices=[('NONE', 'None'), ('NORMAL', 'Normal'), ('HIGH', 'High'), ('CRITICAL', 'Critical')], db_index=True, default='NONE', max_length=16)),
                ('is_internal_only', models.BooleanField(default=False, help_text='Visible to admins/staff only (internal notes).')),
                ('context_snapshot_json', models.JSONField(blank=True, default=dict)),
                ('conversation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='context', to='chat.conversation')),
                ('student_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='student_context_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MessageReaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('emoji_code', models.CharField(db_index=True, max_length=32)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='chat.message')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='message_reactions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name='conversationcontext',
            index=models.Index(fields=['module', 'entity_type', 'entity_id'], name='chat_conver_module_8f3c2a_idx'),
        ),
        migrations.AddIndex(
            model_name='conversationcontext',
            index=models.Index(fields=['module', '-updated_at'], name='chat_conver_module_9a1b4c_idx'),
        ),
        migrations.AddIndex(
            model_name='conversationcontext',
            index=models.Index(fields=['urgency', '-updated_at'], name='chat_conver_urgency_2d8e1f_idx'),
        ),
        migrations.AddConstraint(
            model_name='messagereaction',
            constraint=models.UniqueConstraint(fields=('message', 'user', 'emoji_code'), name='uniq_reaction_per_user_emoji'),
        ),
        migrations.AddIndex(
            model_name='messagereaction',
            index=models.Index(fields=['message', 'emoji_code'], name='chat_messag_message_4e7a9b_idx'),
        ),
    ]
