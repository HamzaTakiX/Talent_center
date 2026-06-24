import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('career_coach', '0002_rename_ai_conv_user_sess_created_idx_ai_conversa_user_id_1811da_idx'),
    ]

    operations = [
        migrations.CreateModel(
            name='AiCoachSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.UUIDField(db_index=True, default=uuid.uuid4)),
                ('title', models.CharField(blank=True, default='', max_length=255)),
                ('mode', models.CharField(blank=True, default='career-coach', max_length=32)),
                ('is_archived', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='ai_coach_sessions',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'db_table': 'ai_coach_sessions',
                'ordering': ['-updated_at'],
                'indexes': [
                    models.Index(fields=['user', 'is_archived', '-updated_at'], name='ai_coach_sess_user_arch_upd_idx'),
                ],
                'constraints': [
                    models.UniqueConstraint(
                        fields=('user', 'session_id'),
                        name='ai_coach_session_user_session_uniq',
                    ),
                ],
            },
        ),
    ]
