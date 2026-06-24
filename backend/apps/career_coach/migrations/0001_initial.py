# Generated manually for career_coach app

import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AiConversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.UUIDField(db_index=True, default=uuid.uuid4)),
                ('role', models.CharField(choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')], max_length=16)),
                ('message', models.TextField()),
                ('mode', models.CharField(blank=True, default='career-coach', max_length=32)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ai_conversations',
                'ordering': ['created_at'],
                'indexes': [models.Index(fields=['user', 'session_id', 'created_at'], name='ai_conv_user_sess_created_idx')],
            },
        ),
    ]
