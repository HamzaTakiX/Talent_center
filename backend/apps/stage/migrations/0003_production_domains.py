# Production domain expansion — Company, Interview, Versioning, Webhooks, SLA, Pipeline, Recommendations

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stage', '0002_extended_lifecycle_and_import'),
        ('accounts_et_roles', '0005_student_internship_derived_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('legal_name', models.CharField(blank=True, default='', max_length=255)),
                ('slug', models.SlugField(blank=True, db_index=True, default='', max_length=280)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='companies/logos/')),
                ('website', models.URLField(blank=True, default='', max_length=512)),
                ('description', models.TextField(blank=True, default='')),
                ('sector', models.CharField(blank=True, db_index=True, default='', max_length=128)),
                ('city', models.CharField(blank=True, default='', max_length=128)),
                ('country', models.CharField(blank=True, default='Maroc', max_length=128)),
                ('status', models.CharField(db_index=True, default='PENDING_VERIFICATION', max_length=24)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('blacklisted_at', models.DateTimeField(blank=True, null=True)),
                ('blacklisted_reason', models.TextField(blank=True, default='')),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('verified_by', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='verified_companies', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.AddField(
            model_name='internshipoffer',
            name='company',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name='offers', to='stage.company',
            ),
        ),
        migrations.AddField(
            model_name='candidatecollection',
            name='linked_offer',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name='candidate_collections', to='stage.internshipoffer',
            ),
        ),
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('interview_type', models.CharField(default='VIDEO', max_length=16)),
                ('status', models.CharField(db_index=True, default='SCHEDULED', max_length=16)),
                ('scheduled_at', models.DateTimeField(db_index=True)),
                ('duration_minutes', models.PositiveSmallIntegerField(default=45)),
                ('location', models.CharField(blank=True, default='', max_length=255)),
                ('meeting_url', models.URLField(blank=True, default='', max_length=1024)),
                ('interviewer_name', models.CharField(blank=True, default='', max_length=255)),
                ('simulator_session_id', models.CharField(blank=True, default='', max_length=128)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('application', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='interviews', to='stage.offerapplication',
                )),
                ('scheduled_by', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='scheduled_interviews', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='OfferVersion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('version_number', models.PositiveIntegerField(db_index=True)),
                ('snapshot_json', models.JSONField(default=dict)),
                ('change_summary', models.TextField(blank=True, default='')),
                ('is_current', models.BooleanField(db_index=True, default=True)),
                ('restored_from_version', models.PositiveIntegerField(blank=True, null=True)),
                ('offer', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='versions', to='stage.internshipoffer',
                )),
                ('changed_by', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='+', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='PipelineColumn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('code', models.SlugField(max_length=32, unique=True)),
                ('label', models.CharField(max_length=128)),
                ('application_statuses', models.JSONField(default=list)),
                ('sort_order', models.PositiveSmallIntegerField(db_index=True, default=0)),
                ('is_terminal', models.BooleanField(default=False)),
                ('color', models.CharField(blank=True, default='', max_length=16)),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='SlaRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('code', models.CharField(max_length=64, unique=True)),
                ('entity_type', models.CharField(db_index=True, max_length=24)),
                ('threshold_hours', models.PositiveIntegerField(default=24)),
                ('escalation_level', models.PositiveSmallIntegerField(default=1)),
                ('notify_supervisor', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('description', models.TextField(blank=True, default='')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='SlaViolation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('entity_type', models.CharField(db_index=True, max_length=24)),
                ('entity_id', models.CharField(db_index=True, max_length=64)),
                ('status', models.CharField(db_index=True, default='OPEN', max_length=16)),
                ('detected_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('escalated_at', models.DateTimeField(blank=True, null=True)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('rule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='violations', to='stage.slarule')),
                ('assigned_to', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='sla_violations', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='WebhookSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('target_url', models.URLField(max_length=1024)),
                ('secret', models.CharField(blank=True, default='', max_length=128)),
                ('event_types', models.JSONField(default=list)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_by', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='webhook_subscriptions', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='WebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('event_code', models.CharField(db_index=True, max_length=64)),
                ('entity_type', models.CharField(blank=True, default='', max_length=64)),
                ('entity_id', models.CharField(blank=True, default='', max_length=64)),
                ('payload_json', models.JSONField(default=dict)),
                ('source_app', models.CharField(db_index=True, default='stage', max_length=32)),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='WebhookDelivery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(db_index=True, default='PENDING', max_length=16)),
                ('attempt_count', models.PositiveSmallIntegerField(default=0)),
                ('response_status_code', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('response_body', models.TextField(blank=True, default='')),
                ('last_attempt_at', models.DateTimeField(blank=True, null=True)),
                ('next_retry_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deliveries', to='stage.webhookevent')),
                ('subscription', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deliveries', to='stage.webhooksubscription')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='OfferRecommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('recommendation_type', models.CharField(db_index=True, max_length=24)),
                ('score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('reasons_json', models.JSONField(blank=True, default=list)),
                ('expires_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('is_dismissed', models.BooleanField(db_index=True, default=False)),
                ('offer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recommendations', to='stage.internshipoffer')),
                ('student_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='offer_recommendations', to='accounts_et_roles.studentprofile')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.AddConstraint(
            model_name='offerversion',
            constraint=models.UniqueConstraint(fields=('offer', 'version_number'), name='uniq_offer_version_number'),
        ),
    ]
